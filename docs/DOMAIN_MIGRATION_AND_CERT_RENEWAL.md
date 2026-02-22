# Domain Migration Record & Certificate Renewal Guide

> Complete record of the domain migration from `gavigo.chanmeng.org` to `ire.gavigo.com`, and step-by-step instructions for Let's Encrypt certificate renewal.
>
> **Migration Date**: 2026-02-22
> **Certificate Expiry**: 2026-05-23
> **Renewal Deadline**: Renew before 2026-05-13 (10 days before expiry)
>
> **This document is designed to be read by Claude Code** to perform automated certificate renewal using CLI tools and Claude in Chrome browser automation.

---

## Part 1: What Was Done (Migration Record)

### 1.1 Previous Setup (Before Migration)

- **Domain**: `gavigo.chanmeng.org`
- **DNS Provider**: Cloudflare (managing `chanmeng.org` zone)
- **TLS**: Cloudflare Origin CA certificate (RSA 2048, 15-year validity, `*.chanmeng.org`)
- **Architecture**: Browser → Cloudflare CDN (edge TLS) → DO Load Balancer (Origin CA TLS termination) → nginx pod
- **Cloudflare SSL Mode**: Full (strict)
- **DO Certificate ID**: `b9c7acc4-19a9-4460-92b3-2a9785a08f97` (name: `gavigo-origin-cert`)
- **LB redirect-http-to-https**: `false` (Cloudflare handled HTTP→HTTPS redirect)

### 1.2 New Setup (After Migration)

- **Domain**: `ire.gavigo.com`
- **DNS Provider**: GoDaddy (managing `gavigo.com` zone)
- **TLS**: Let's Encrypt certificate (90-day validity, manual renewal via DNS-01 challenge)
- **Architecture**: Browser → DO Load Balancer (Let's Encrypt TLS termination) → nginx pod
- **No CDN**: Direct connection to DO Load Balancer (no Cloudflare in the path)
- **DO Certificate ID**: `8f5d1c55-9c54-415e-a3f5-742ef516b76f` (name: `ire-gavigo-cert`)
- **LB redirect-http-to-https**: `true` (LB handles HTTP→HTTPS redirect directly)
- **LB IP**: `146.190.194.246` (unchanged from previous setup)

### 1.3 Steps Performed

#### Step 1: Added A Record on GoDaddy

- **Where**: GoDaddy DNS Management for `gavigo.com` (https://dcc.godaddy.com/control/dnsmanagement?domainName=gavigo.com)
- **Record**: A record, Name: `ire`, Value: `146.190.194.246`, TTL: 600 seconds
- **Method**: Used Claude in Chrome browser automation to navigate GoDaddy UI, fill in the form, and save
- **Verification**: `nslookup ire.gavigo.com 8.8.8.8` returned `146.190.194.246`

#### Step 2: Obtained Let's Encrypt Certificate via Certbot

- **Tool**: Docker-based certbot (`certbot/certbot:latest`)
- **Challenge Type**: DNS-01 (manual) — requires adding a TXT record on GoDaddy
- **Command run**:
  ```bash
  docker run -it --rm -v "D:/certs/letsencrypt:/etc/letsencrypt" certbot/certbot certonly --manual --preferred-challenges dns -d ire.gavigo.com
  ```
- **Email registered**: `chan@gavigo.com`
- **Certificate files saved to**: `D:/certs/letsencrypt/archive/ire.gavigo.com/`
  - `cert1.pem` — leaf certificate
  - `chain1.pem` — CA chain (Let's Encrypt intermediate)
  - `fullchain1.pem` — cert + chain combined
  - `privkey1.pem` — private key
- **Symlinks at**: `D:/certs/letsencrypt/live/ire.gavigo.com/` (point to archive files)
- **Note**: On Windows, `doctl` cannot follow symlinks, so use the actual files in the `archive/` directory

#### Step 2b: Added TXT Record on GoDaddy for ACME Challenge

- **Record**: TXT, Name: `_acme-challenge.ire`, Value: `YJ620RZhcDIY602XQA_sR7P1EnTZMmQSSQ5hCp9sAjc`, TTL: 1/2 Saat (30 min)
- **Method**: Used Claude in Chrome browser automation on GoDaddy DNS page
- **Verification**: `nslookup -type=TXT _acme-challenge.ire.gavigo.com 8.8.8.8` returned the correct value
- **Note**: This TXT record remains on GoDaddy. On renewal, its **value must be updated** (not a new record — edit the existing one).

#### Step 3: Uploaded Certificate to DigitalOcean

- **Command run**:
  ```bash
  doctl compute certificate create \
    --type custom \
    --name ire-gavigo-cert \
    --leaf-certificate-path "D:/certs/letsencrypt/archive/ire.gavigo.com/cert1.pem" \
    --certificate-chain-path "D:/certs/letsencrypt/archive/ire.gavigo.com/chain1.pem" \
    --private-key-path "D:/certs/letsencrypt/archive/ire.gavigo.com/privkey1.pem"
  ```
- **Result**: Certificate ID `8f5d1c55-9c54-415e-a3f5-742ef516b76f`, State: `verified`
- **Important**: Use the `archive/` path (actual files), NOT the `live/` path (symlinks) on Windows

#### Step 4: Updated K8s Service with New Certificate

- **File modified**: `k8s/frontend/service.yaml`
- **Changes**:
  - `do-loadbalancer-certificate-id` → `8f5d1c55-9c54-415e-a3f5-742ef516b76f`
  - `do-loadbalancer-redirect-http-to-https` → `"true"` (was `"false"`)
- **Applied**: `kubectl apply -f k8s/frontend/service.yaml` → `service/frontend configured`
- **Result**: LB updated in-place (same REGIONAL type, same IP `146.190.194.246`)

#### Step 5: Updated All Codebase References

Files modified (all `gavigo.chanmeng.org` → `ire.gavigo.com`):

| File | Changes |
|------|---------|
| `mobile/services/api.ts` | Native fallback URL → `https://ire.gavigo.com/api/v1` |
| `CLAUDE.md` | Live URL, deployment status table, changelog, doc links |
| `README.md` | All URLs, architecture diagrams (removed Cloudflare refs), infra table, cost table |
| `docs/DEMO_GUIDE.md` | Both URL references |
| `docs/DEPLOYMENT_STATUS.md` | URLs + old IP references |
| `docs/HTTPS_SETUP_GUIDE.md` | Complete rewrite for Let's Encrypt + GoDaddy DNS |

#### Step 6: Removed Cloudflare DNS Record

- **Where**: Cloudflare Dashboard → `chanmeng.org` zone → DNS Records
- **Action**: Deleted A record `gavigo → 146.190.194.246`
- **Method**: Used Claude in Chrome browser automation — clicked Edit → Delete → confirmed deletion
- **Result**: `gavigo.chanmeng.org` no longer resolves

#### Step 7: Verification

All checks passed:

| Check | Result |
|-------|--------|
| `nslookup ire.gavigo.com` | `146.190.194.246` |
| `curl -I https://ire.gavigo.com/` | `HTTP/1.1 200 OK` |
| `curl -s https://ire.gavigo.com/api/v1/health` | `{"status":"healthy","redis":"connected","kubernetes":"connected"}` |
| `curl -I http://ire.gavigo.com/` | `HTTP/1.1 307 → https://ire.gavigo.com/` |
| Browser: Dashboard loads | Yes, WebSocket connected |
| Browser: Mobile iframe at `/mobile/` | Yes, loads correctly |

---

## Part 2: Certificate Renewal Guide (For Claude Code)

### 2.1 When to Renew

- **Current certificate expires**: 2026-05-23
- **Renew no later than**: 2026-05-13 (10 days before expiry)
- **Let's Encrypt certs are valid for 90 days**; after each renewal, the next deadline is ~80 days out

### 2.2 What Needs to Happen

Certificate renewal involves 4 steps:

1. **Run certbot** to get a new certificate (interactive — gives a new TXT challenge value)
2. **Update the TXT record** `_acme-challenge.ire` on GoDaddy with the new value
3. **Upload the new certificate** to DigitalOcean
4. **Update `service.yaml`** with the new certificate ID and `kubectl apply`

### 2.3 Detailed Renewal Steps

#### Step R1: Run Certbot

This is an **interactive command** that must be run by the user in a terminal (PowerShell). Claude Code should instruct the user to run:

```bash
docker run -it --rm -v "D:/certs/letsencrypt:/etc/letsencrypt" certbot/certbot certonly --manual --preferred-challenges dns -d ire.gavigo.com
```

Certbot will:
1. Ask to agree to ToS (if first time) — answer `y`
2. Output a TXT record value like:
   ```
   Please deploy a DNS TXT record under the name:
   _acme-challenge.ire.gavigo.com.
   with the following value:
   <NEW_CHALLENGE_VALUE>
   ```
3. Wait for user to press Enter after the TXT record is deployed

**The user should paste the certbot output** back to Claude Code so it can extract the new TXT value.

#### Step R2: Update TXT Record on GoDaddy (Claude in Chrome)

Claude Code should use Claude in Chrome browser automation to:

1. Navigate to GoDaddy DNS management: `https://dcc.godaddy.com/control/dnsmanagement?domainName=gavigo.com`
   - The user must already be logged in to GoDaddy
2. Find the existing TXT record `_acme-challenge.ire` in the DNS records list
   - It may be on page 2 or 3 (GoDaddy paginates records, 10 per page)
   - Use the page navigation at the bottom to find it
3. Click the edit (pencil) icon for that TXT record
4. Update the **Değer (Value)** field with the new challenge value from certbot
5. Click **Kaydet (Save)**
6. Wait for DNS propagation (~1-2 minutes)
7. Verify propagation:
   ```bash
   nslookup -type=TXT _acme-challenge.ire.gavigo.com 8.8.8.8
   ```
   The response should contain the new challenge value.

**GoDaddy UI Notes** (the interface is in Turkish):
- **DNS Yönetimi** = DNS Management
- **Tür** = Type
- **Ad** = Name
- **Veri / Değer** = Value
- **Düzenle** = Edit (pencil icon in the last column)
- **Kaydet** = Save
- **Sil** = Delete (trash icon)
- **İptal** = Cancel
- The record type dropdown is a `<select>` element — use `form_input` with ref to set values
- Text fields can be set with `form_input` using the ref from `find` tool

After the TXT record is updated and verified, **tell the user to press Enter in the certbot terminal**.

The user should then paste the certbot output showing the new certificate paths.

#### Step R3: Upload New Certificate to DigitalOcean

After certbot succeeds, the new certificate files will be in the `archive/` directory with incremented numbers (e.g., `cert2.pem`, `chain2.pem`, `privkey2.pem`).

**Important**: Check the actual filenames first:

```bash
ls -la D:/certs/letsencrypt/archive/ire.gavigo.com/
```

Then find the highest-numbered set of files (e.g., `cert2.pem`, `chain2.pem`, `privkey2.pem`).

Upload with a **unique name** (append date):

```bash
doctl compute certificate create \
  --type custom \
  --name ire-gavigo-cert-YYYYMMDD \
  --leaf-certificate-path "D:/certs/letsencrypt/archive/ire.gavigo.com/certN.pem" \
  --certificate-chain-path "D:/certs/letsencrypt/archive/ire.gavigo.com/chainN.pem" \
  --private-key-path "D:/certs/letsencrypt/archive/ire.gavigo.com/privkeyN.pem"
```

Replace `N` with the actual file number and `YYYYMMDD` with the current date.

**Save the new certificate ID** from the output. Verify state is `verified`:

```bash
doctl compute certificate list --format ID,Name,State
```

#### Step R4: Update K8s Service

Edit `k8s/frontend/service.yaml` — replace the old `certificate-id` with the new one:

```yaml
service.beta.kubernetes.io/do-loadbalancer-certificate-id: "<NEW_CERT_ID>"
```

Then apply:

```bash
kubectl apply -f D:/github_repository/gavigo/k8s/frontend/service.yaml
```

Expected output: `service/frontend configured`

#### Step R5: Verify

```bash
# HTTPS should return 200
curl -I https://ire.gavigo.com/

# API should be healthy
curl -s https://ire.gavigo.com/api/v1/health

# HTTP should redirect to HTTPS
curl -I http://ire.gavigo.com/
```

#### Step R6 (Optional): Clean Up Old Certificate

After confirming the new cert works, optionally delete the old certificate from DO:

```bash
doctl compute certificate delete <OLD_CERT_ID> --force
```

### 2.4 Renewal Checklist (Quick Reference)

```
[ ] 1. User runs: docker run -it --rm -v "D:/certs/letsencrypt:/etc/letsencrypt" certbot/certbot certonly --manual --preferred-challenges dns -d ire.gavigo.com
[ ] 2. User pastes certbot output with new TXT challenge value
[ ] 3. Claude in Chrome: Update _acme-challenge.ire TXT record on GoDaddy with new value
[ ] 4. Verify TXT propagation: nslookup -type=TXT _acme-challenge.ire.gavigo.com 8.8.8.8
[ ] 5. User presses Enter in certbot terminal
[ ] 6. User pastes certbot success output
[ ] 7. ls D:/certs/letsencrypt/archive/ire.gavigo.com/ to find new cert files
[ ] 8. doctl compute certificate create --type custom --name ire-gavigo-cert-YYYYMMDD ...
[ ] 9. Edit k8s/frontend/service.yaml with new cert ID
[ ] 10. kubectl apply -f k8s/frontend/service.yaml
[ ] 11. curl -I https://ire.gavigo.com/ → 200 OK
[ ] 12. (Optional) doctl compute certificate delete <old-cert-id> --force
```

---

## Part 3: Key Reference Information

### DNS Records on GoDaddy (gavigo.com)

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | ire | 146.190.194.246 | 600s | Points domain to DO Load Balancer |
| TXT | _acme-challenge.ire | *(changes each renewal)* | 1800s | Let's Encrypt DNS-01 challenge |

### DigitalOcean Resources

| Resource | Value |
|----------|-------|
| LB IP | 146.190.194.246 |
| LB Type | REGIONAL (Layer 7, supports TLS termination) |
| Current Cert ID | 8f5d1c55-9c54-415e-a3f5-742ef516b76f |
| Current Cert Name | ire-gavigo-cert |
| Cert Expiry | 2026-05-23 |
| K8s Cluster | gavigo-cluster (sgp1) |
| K8s Namespace | gavigo |
| Service Name | frontend |

### Local File Paths (Windows)

| Path | Purpose |
|------|---------|
| `D:/certs/letsencrypt/` | Certbot data directory (mounted into Docker) |
| `D:/certs/letsencrypt/archive/ire.gavigo.com/` | Actual certificate files (use these for doctl) |
| `D:/certs/letsencrypt/live/ire.gavigo.com/` | Symlinks (do NOT use with doctl on Windows) |
| `D:/github_repository/gavigo/k8s/frontend/service.yaml` | K8s service with cert ID annotation |

### Tools Required

| Tool | Purpose | Installation |
|------|---------|-------------|
| Docker | Run certbot container | Already installed |
| doctl | Upload cert to DO, manage LB | Already installed |
| kubectl | Apply K8s service changes | Already installed |
| Claude in Chrome | Automate GoDaddy DNS record updates | Browser extension |

### GoDaddy Access

- **URL**: https://dcc.godaddy.com/control/dnsmanagement?domainName=gavigo.com
- **Interface Language**: Turkish
- **Login**: User must be logged in before Claude in Chrome can automate
- **Account**: Logged in as "Saba Geçgil" (shown in top banner)

---

## Part 4: Troubleshooting

### Certbot Fails with "Challenge did not pass"

The TXT record value was wrong or DNS hasn't propagated yet. Steps:
1. Verify the TXT record value matches exactly what certbot provided
2. Wait 2-3 minutes for DNS propagation
3. Check: `nslookup -type=TXT _acme-challenge.ire.gavigo.com 8.8.8.8`
4. If the value is wrong, edit the TXT record on GoDaddy and try again

### doctl Certificate Upload Fails: "Certificate is incomplete"

This means one of the three files is missing or the flags are wrong. Ensure:
- `--leaf-certificate-path` points to `certN.pem` (NOT fullchain)
- `--certificate-chain-path` points to `chainN.pem`
- `--private-key-path` points to `privkeyN.pem`
- All three files are from the same renewal (same N number)

### kubectl apply Shows No Change

If `kubectl apply` returns `service/frontend unchanged`, the cert ID in the YAML might be the same as before. Double-check you updated the YAML file with the **new** cert ID.

### HTTPS Not Working After Cert Update

The LB may take 1-2 minutes to pick up the new certificate. Wait and retry. If it still fails:
```bash
# Check LB forwarding rules
doctl compute load-balancer list --output json
# Check K8s service events
kubectl -n gavigo describe svc frontend
```

### GoDaddy TXT Record Not Found in UI

GoDaddy paginates DNS records (10 per page). The TXT record for `_acme-challenge.ire` may be on page 2 or 3. Use the page navigation at the bottom of the records list, or use the filter feature if available.
