# HTTPS Setup Guide: Let's Encrypt + DigitalOcean Load Balancer

> How to configure HTTPS for a DOKS (DigitalOcean Kubernetes) cluster using a Let's Encrypt certificate with TLS termination at the Load Balancer. DNS is managed by GoDaddy.

## Architecture Overview

```
Browser ──HTTPS──> DO Load Balancer ──HTTP──> nginx (K8s Pod)
                   (TLS Termination)         (Port 80)
```

- **Browser → LB**: Let's Encrypt certificate (free, 90-day validity, manual renewal)
- **LB → Pod**: Plain HTTP on port 80 (internal cluster traffic)
- **DNS**: GoDaddy A record `ire.gavigo.com` → DO LB IP

## Prerequisites

- A domain with DNS access (e.g., `gavigo.com` on GoDaddy)
- A running DOKS cluster with a `LoadBalancer` Service
- `doctl` CLI authenticated with your DigitalOcean account
- `kubectl` configured for your cluster
- `certbot` installed (via pip, brew, or Docker)

## Step 1: Create DNS Record on GoDaddy

1. Log in to [GoDaddy DNS Management](https://dcc.godaddy.com/) for `gavigo.com`
2. Add an **A record**:
   - **Name**: `ire`
   - **Value**: `146.190.194.246` (DO LB IP)
   - **TTL**: 600 (10 minutes)
3. Verify DNS propagation:

```bash
nslookup ire.gavigo.com
# Expected: Address: 146.190.194.246
```

## Step 2: Obtain Let's Encrypt Certificate via Certbot

Use the DNS-01 challenge (requires adding a TXT record on GoDaddy, but doesn't need the server to be reachable):

```bash
certbot certonly --manual --preferred-challenges dns -d ire.gavigo.com
```

When prompted:
1. Certbot will ask you to create a **TXT record** on GoDaddy:
   - **Name**: `_acme-challenge.ire`
   - **Value**: *(provided by certbot)*
   - **TTL**: 600
2. Add the TXT record in GoDaddy DNS management
3. Wait ~2 minutes for DNS propagation
4. Press Enter in certbot to continue

Output files (typically in `/etc/letsencrypt/live/ire.gavigo.com/`):
- `cert.pem` — leaf certificate
- `chain.pem` — CA chain (Let's Encrypt intermediate)
- `fullchain.pem` — cert + chain combined
- `privkey.pem` — private key

## Step 3: Upload Certificate to DigitalOcean

```bash
doctl compute certificate create \
  --type custom \
  --name ire-gavigo-cert \
  --leaf-certificate-path /etc/letsencrypt/live/ire.gavigo.com/cert.pem \
  --certificate-chain-path /etc/letsencrypt/live/ire.gavigo.com/chain.pem \
  --private-key-path /etc/letsencrypt/live/ire.gavigo.com/privkey.pem
```

Get the certificate ID:

```bash
doctl compute certificate list --format ID,Name,State
# Expected: State = verified
# Save the ID for the next step
```

## Step 4: Configure the K8s LoadBalancer Service

### Critical: Load Balancer Type

DigitalOcean has two LB types:

| Type | Protocol Support | TLS Termination |
|------|-----------------|-----------------|
| `REGIONAL_NETWORK` | TCP/UDP only (Layer 4) | Not supported |
| `REGIONAL` | HTTP/HTTPS/HTTP2 (Layer 7) | Supported |

**DOKS may default to `REGIONAL_NETWORK`**. You must explicitly set the type to `REGIONAL` for TLS termination to work.

### Service YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: gavigo
  labels:
    app: frontend
  annotations:
    # Use REGIONAL (HTTP) LB type for TLS termination support
    service.beta.kubernetes.io/do-loadbalancer-type: "REGIONAL"
    # HTTPS on port 443, HTTP on port 80
    service.beta.kubernetes.io/do-loadbalancer-protocol: "http"
    service.beta.kubernetes.io/do-loadbalancer-tls-ports: "443"
    service.beta.kubernetes.io/do-loadbalancer-certificate-id: "<YOUR_CERTIFICATE_ID>"
    # Enable HTTP→HTTPS redirect (LB handles this directly)
    service.beta.kubernetes.io/do-loadbalancer-redirect-http-to-https: "true"
spec:
  type: LoadBalancer
  ports:
    - name: http
      port: 80
      targetPort: 80
      protocol: TCP
    - name: https
      port: 443
      targetPort: 80
      protocol: TCP
  selector:
    app: frontend
```

### Annotation Reference

| Annotation | Value | Purpose |
|------------|-------|---------|
| `do-loadbalancer-type` | `REGIONAL` | Use HTTP LB (required for TLS termination) |
| `do-loadbalancer-protocol` | `http` | Backend protocol (LB → nginx is plain HTTP) |
| `do-loadbalancer-tls-ports` | `443` | Which ports use HTTPS with TLS termination |
| `do-loadbalancer-certificate-id` | `<cert-id>` | The DO certificate ID for TLS |
| `do-loadbalancer-redirect-http-to-https` | `true` | Redirect HTTP to HTTPS at the LB level |

> **`certificate-id` vs `certificate-name`**: Both work. `certificate-name` (available in DOKS 1.26+) is better for Let's Encrypt certs that rotate (ID changes on renewal, name stays the same).

## Step 5: Apply the Service

### If Updating an Existing REGIONAL LB (Same LB Type)

Simply apply — the certificate and redirect settings update in-place:

```bash
kubectl apply -f k8s/frontend/service.yaml
```

### If Changing LB Type (e.g., from REGIONAL_NETWORK)

**The LB type cannot be changed in-place.** You must delete and recreate the Service, which creates a new LB with a **new external IP**.

```bash
# 1. Delete the existing service (destroys the old LB)
kubectl -n gavigo delete svc frontend

# 2. Wait for the old LB to be fully removed
doctl compute load-balancer list --format ID,Name,Status,IP

# 3. Recreate the service
kubectl apply -f k8s/frontend/service.yaml

# 4. Wait for the new LB to provision (~1-3 minutes)
kubectl -n gavigo get svc frontend -w

# 5. Update DNS A record on GoDaddy with the new IP
```

### Verify the LB Configuration

```bash
doctl compute load-balancer list --output json | python3 -c "
import sys, json
for lb in json.load(sys.stdin):
    print(f'Type: {lb[\"type\"]}')
    for rule in lb['forwarding_rules']:
        print(f'  {rule[\"entry_protocol\"]}:{rule[\"entry_port\"]} -> {rule[\"target_protocol\"]}:{rule[\"target_port\"]} cert:{rule.get(\"certificate_id\",\"none\")}')
"
```

Expected output:

```
Type: REGIONAL
  http:80 -> http:80 cert:
  https:443 -> http:80 cert:<your-cert-id>
```

## Step 6: Verify

### Test HTTPS End-to-End

```bash
# HTTPS should work
curl -I https://ire.gavigo.com/
# Expected: HTTP/1.1 200 OK

# HTTP should redirect to HTTPS (LB redirect)
curl -I http://ire.gavigo.com/
# Expected: HTTP/1.1 301 Moved Permanently, Location: https://...
```

### Verify WebSocket

Open the browser dev tools (F12) → Network tab → filter by WS. The `/ws` connection should show status 101 (Switching Protocols) over `wss://`.

### Verify Mobile iframe

Navigate to `https://ire.gavigo.com/mobile/` — should load the Expo web app.

## Certificate Renewal (Every ~80 Days)

Let's Encrypt certificates expire every 90 days. Renew ~10 days before expiry.

### Renewal Steps

```bash
# 1. Run certbot again
certbot certonly --manual --preferred-challenges dns -d ire.gavigo.com

# 2. Update/create TXT record on GoDaddy as prompted
#    Name: _acme-challenge.ire
#    Value: <new value from certbot>

# 3. Upload new cert to DigitalOcean
doctl compute certificate create \
  --type custom \
  --name ire-gavigo-cert-YYYYMMDD \
  --leaf-certificate-path /etc/letsencrypt/live/ire.gavigo.com/cert.pem \
  --certificate-chain-path /etc/letsencrypt/live/ire.gavigo.com/chain.pem \
  --private-key-path /etc/letsencrypt/live/ire.gavigo.com/privkey.pem

# 4. Get new cert ID
doctl compute certificate list --format ID,Name,State

# 5. Update service.yaml with new cert ID and apply
kubectl apply -f k8s/frontend/service.yaml
```

### Alternative: Transfer DNS to DigitalOcean

If manual renewal becomes tedious, transfer `gavigo.com` DNS to DigitalOcean nameservers. This enables DO's automatic Let's Encrypt integration (auto-provision + auto-renew, zero maintenance).

## Troubleshooting

### SSL Handshake Failed / ERR_SSL_PROTOCOL_ERROR

**Cause**: The LB isn't terminating TLS (wrong LB type or missing cert).

**Check**:
```bash
doctl compute load-balancer list --output json | grep -E '"type"|entry_protocol|certificate_id'
```

If you see `REGIONAL_NETWORK` or `tcp` protocols, the LB doesn't support TLS termination. Recreate with `do-loadbalancer-type: REGIONAL`.

### Connection Timed Out

**Cause**: DNS not pointing to LB, or LB not healthy.

**Check**:
- Is the LB active? `doctl compute load-balancer list --format Status`
- Is port 443 in the Service spec? `kubectl -n gavigo get svc frontend`
- Does DNS resolve correctly? `nslookup ire.gavigo.com`

### LB Annotations Not Taking Effect

**Cause**: The DOKS cloud controller may not reconcile immediately, or the LB type can't be changed in-place.

**Fix**:
1. Check K8s events: `kubectl -n gavigo describe svc frontend`
2. Look for `EnsuredLoadBalancer` events
3. If the LB type is wrong, delete and recreate the Service (see Step 5)

### Certificate Upload Fails: "Certificate is incomplete"

**Cause**: Missing the CA chain or using wrong flag for the leaf certificate.

**Fix**: Use all three flags:
```bash
doctl compute certificate create \
  --name my-cert \
  --type custom \
  --leaf-certificate-path cert.pem \
  --certificate-chain-path chain.pem \
  --private-key-path privkey.pem
```

## Security Notes

- **Never commit certificate private keys** to version control
- Add `*.pem` to `.gitignore` if not already present
- The `certificate-id` in `service.yaml` is safe to commit — it's a reference to a DO resource, not the certificate itself
- Let's Encrypt certificates are publicly trusted — browsers will show a valid HTTPS lock icon

## Cost Impact

| Component | Cost |
|-----------|------|
| Let's Encrypt Certificate | Free |
| GoDaddy DNS | Free (included with domain) |
| DigitalOcean REGIONAL Load Balancer | $12/mo (same as before) |
| **Total additional cost** | **$0** |

## References

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot DNS Challenge](https://certbot.eff.org/docs/using.html#manual)
- [DigitalOcean K8s LB Annotations](https://github.com/digitalocean/digitalocean-cloud-controller-manager/blob/master/docs/controllers/services/annotations.md)
- [DigitalOcean K8s LB Configuration](https://docs.digitalocean.com/products/kubernetes/how-to/configure-load-balancers/)
