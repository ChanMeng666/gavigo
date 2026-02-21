# HTTPS Setup Guide: Cloudflare Origin CA + DigitalOcean Load Balancer

> How to configure end-to-end HTTPS for a DOKS (DigitalOcean Kubernetes) cluster behind Cloudflare using a free Origin CA certificate with TLS termination at the Load Balancer.

## Architecture Overview

```
Browser ──HTTPS──> Cloudflare (Edge) ──HTTPS──> DO Load Balancer ──HTTP──> nginx (K8s Pod)
                   (Edge TLS)                   (TLS Termination)         (Port 80)
```

- **Browser → Cloudflare**: Cloudflare's edge certificate (automatic, free)
- **Cloudflare → Origin LB**: Cloudflare Origin CA certificate (free, 15-year validity)
- **LB → Pod**: Plain HTTP on port 80 (internal cluster traffic)

## Prerequisites

- A domain managed by Cloudflare (e.g., `chanmeng.org`)
- A running DOKS cluster with a `LoadBalancer` Service
- `doctl` CLI authenticated with your DigitalOcean account
- `kubectl` configured for your cluster

## Step 1: Generate a Cloudflare Origin CA Certificate

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain → **SSL/TLS** → **Origin Server**
3. Click **Create Certificate**
4. Configure:
   - **Key type**: RSA (2048)
   - **Hostnames**: `*.yourdomain.com` and `yourdomain.com` (pre-populated)
   - **Validity**: 15 years (default)
5. Click **Create**
6. **Save both PEM blocks** to local files before closing (the private key is shown only once):
   - `origin-cert.pem` — the Origin Certificate
   - `origin-key.pem` — the Private Key

## Step 2: Download the Cloudflare Origin CA Root Certificate

The DigitalOcean certificate upload requires the full certificate chain. Download the Cloudflare Origin CA root:

```bash
# RSA root (for RSA key type)
curl -o origin-ca-root.pem https://developers.cloudflare.com/ssl/static/origin_ca_rsa_root.pem

# ECC root (if you chose ECC key type instead)
# curl -o origin-ca-root.pem https://developers.cloudflare.com/ssl/static/origin_ca_ecc_root.pem
```

## Step 3: Upload the Certificate to DigitalOcean

Use `doctl` with **three separate files** — leaf certificate, CA chain, and private key:

```bash
doctl compute certificate create \
  --name gavigo-origin-cert \
  --type custom \
  --leaf-certificate-path origin-cert.pem \
  --certificate-chain-path origin-ca-root.pem \
  --private-key-path origin-key.pem
```

Verify the upload:

```bash
doctl compute certificate list --format ID,Name,State
# Expected: State = verified
```

> **Common error**: `Certificate is incomplete` — this happens if you use `--certificate-chain-path` for the leaf cert instead of `--leaf-certificate-path`, or if you omit the CA root chain. The `doctl` command requires all three flags for custom certificates.

### Save the Certificate ID

Note the certificate ID from the output — you'll need it for the K8s Service annotation:

```bash
doctl compute certificate list --format ID,Name
# Example: b9c7acc4-19a9-4460-92b3-2a9785a08f97    gavigo-origin-cert
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
    service.beta.kubernetes.io/do-loadbalancer-redirect-http-to-https: "false"
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
| `do-loadbalancer-redirect-http-to-https` | `false` | Let Cloudflare handle HTTP→HTTPS redirect |

> **Why `redirect-http-to-https: false`?** Cloudflare already handles this redirect at the edge. If the LB also redirects, health checks on port 80 may fail. Keep port 80 open at the LB level.

> **`certificate-id` vs `certificate-name`**: Both work. `certificate-id` is more widely supported. `certificate-name` (available in DOKS 1.26+) is better for Let's Encrypt certs that rotate (ID changes on renewal, name stays the same). For Origin CA certs (15-year validity), either works.

## Step 5: Apply the Service

### If Changing LB Type on an Existing Service

**The LB type cannot be changed in-place.** You must delete and recreate the Service, which destroys the old LB and creates a new one with a **new external IP**.

```bash
# 1. Delete the existing service (destroys the old LB)
kubectl -n gavigo delete svc frontend

# 2. Wait for the old LB to be fully removed
doctl compute load-balancer list --format ID,Name,Status,IP
# Wait until the list is empty

# 3. Recreate the service
kubectl apply -f k8s/frontend/service.yaml

# 4. Wait for the new LB to provision (~1-3 minutes)
kubectl -n gavigo get svc frontend -w
# Wait until EXTERNAL-IP changes from <pending> to an IP address
```

### If Creating a New Service (No Existing LB)

Simply apply directly:

```bash
kubectl apply -f k8s/frontend/service.yaml
```

### Verify the LB Configuration

```bash
# Check the LB type and forwarding rules
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
  https:443 -> http:80 cert:b9c7acc4-...
```

If you see `Type: REGIONAL_NETWORK` with `tcp` protocols and no certificate, the annotations are not being applied — see Troubleshooting below.

## Step 6: Update Cloudflare DNS

If the LB IP changed (e.g., after recreating the Service), update the DNS record:

1. Go to Cloudflare Dashboard → your domain → **DNS** → **Records**
2. Edit the A record for your subdomain (e.g., `gavigo`)
3. Update the **IPv4 address** to the new LB IP
4. Ensure **Proxy status** is set to **Proxied** (orange cloud)
5. Click **Save**

Alternatively via the Cloudflare API:

```bash
# Get the zone ID and record ID
ZONE_ID="your-zone-id"
RECORD_ID="your-record-id"
NEW_IP="146.190.194.246"

curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"content\":\"$NEW_IP\"}"
```

## Step 7: Set Cloudflare SSL Mode

1. Go to Cloudflare Dashboard → your domain → **SSL/TLS** → **Overview**
2. Click **Configure**
3. Select **Custom SSL/TLS**
4. Choose **Full (strict)**
5. Click **Save**

### SSL Mode Comparison

| Mode | Cloudflare → Origin | Origin Cert Required | Validates Cert |
|------|---------------------|---------------------|----------------|
| Off | HTTP | No | No |
| Flexible | HTTP | No | No |
| Full | HTTPS | Yes (any) | No |
| **Full (strict)** | **HTTPS** | **Yes (trusted)** | **Yes** |

**Use Full (strict)** with Origin CA certificates — Cloudflare trusts its own Origin CA, so validation passes. This is the most secure option.

## Step 8: Verify

### Test HTTPS End-to-End

```bash
# Via Cloudflare (end-to-end)
curl -I https://gavigo.chanmeng.org/
# Expected: HTTP/1.1 200 OK

# HTTP should redirect to HTTPS (Cloudflare edge redirect)
curl -I http://gavigo.chanmeng.org/
# Expected: HTTP/1.1 301 Moved Permanently, Location: https://...

# Direct to origin LB IP (bypassing Cloudflare)
curl -kvI https://146.190.194.246/
# Expected: TLS handshake succeeds (cert will show as untrusted since Origin CA
# is only trusted by Cloudflare, not by browsers directly)
```

### Verify WebSocket

Open the browser dev tools (F12) → Network tab → filter by WS. The `/ws` connection should show status 101 (Switching Protocols) over `wss://`.

### Verify Mobile iframe

Navigate to `https://gavigo.chanmeng.org/mobile/` — should load the Expo web app.

## Troubleshooting

### Error 525: SSL Handshake Failed

**Cause**: Cloudflare is trying HTTPS to the origin, but the LB isn't terminating TLS.

**Check**:
```bash
doctl compute load-balancer list --output json | grep -E '"type"|entry_protocol|certificate_id'
```

If you see `REGIONAL_NETWORK` or `tcp` protocols, the LB doesn't support TLS termination. You need to recreate it with `do-loadbalancer-type: REGIONAL`.

### Error 522: Connection Timed Out

**Cause**: Cloudflare can't reach the origin on port 443.

**Check**:
- Is the LB active? `doctl compute load-balancer list --format Status`
- Is port 443 in the Service spec? `kubectl -n gavigo get svc frontend`
- Is the DNS A record pointing to the correct (current) LB IP?

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
  --leaf-certificate-path origin-cert.pem \        # Your cert
  --certificate-chain-path origin-ca-root.pem \    # Cloudflare CA root
  --private-key-path origin-key.pem                # Your private key
```

### HTTP Health Checks Failing After HTTPS Setup

**Cause**: If `redirect-http-to-https` is `true`, the LB health check on port 80 gets a 301 redirect instead of 200.

**Fix**: Set `do-loadbalancer-redirect-http-to-https: "false"` and let Cloudflare handle the redirect.

## Security Notes

- **Never commit certificate private keys** to version control. The `origin-key.pem` should be deleted after uploading to DigitalOcean.
- Add `*.pem` to `.gitignore` if not already present.
- The Origin CA certificate is only trusted by Cloudflare — browsers connecting directly to the origin IP will see a certificate warning. This is expected and actually provides an extra layer of security (direct access is discouraged).
- The `certificate-id` in `service.yaml` is safe to commit — it's a reference to a DO resource, not the certificate itself.

## Cost Impact

| Component | Cost |
|-----------|------|
| Cloudflare Origin CA Certificate | Free |
| Cloudflare SSL/TLS (Full strict) | Free (included in Free plan) |
| DigitalOcean REGIONAL Load Balancer | Same as REGIONAL_NETWORK ($12/mo) |
| **Total additional cost** | **$0** |

## References

- [Cloudflare Origin CA Setup](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Cloudflare SSL Modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
- [DigitalOcean K8s LB Annotations](https://github.com/digitalocean/digitalocean-cloud-controller-manager/blob/master/docs/controllers/services/annotations.md)
- [DigitalOcean K8s LB Configuration](https://docs.digitalocean.com/products/kubernetes/how-to/configure-load-balancers/)
- [Cloudflare Origin CA Root Certificates](https://developers.cloudflare.com/ssl/static/origin_ca_rsa_root.pem)
