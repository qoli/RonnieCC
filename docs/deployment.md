# Deployment

## GitHub Pages

- Repository: https://github.com/qoli/RonnieCC
- Source: `main` branch, `/` root
- Custom domain: `ronniewong.cc`
- CNAME file: `/CNAME`

GitHub Pages has been configured through the GitHub API. The page currently redirects the default
`qoli.github.io/RonnieCC` URL to `ronniewong.cc`, so the live domain must have correct DNS before the
site is reachable through the custom domain.

## DNS Target

For `ronniewong.cc` as an apex domain, configure these DNS records:

| Type | Name | Value | Proxy |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| AAAA | `@` | `2606:50c0:8000::153` | DNS only |
| AAAA | `@` | `2606:50c0:8001::153` | DNS only |
| AAAA | `@` | `2606:50c0:8002::153` | DNS only |
| AAAA | `@` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `qoli.github.io` | DNS only |

## Current Cloudflare Zone

The Cloudflare API account available to Codex has the `ronniewong.cc` zone:

- Zone ID: `f12f78e4030fd73750c0eb1264ad6b31`
- Nameservers: `duke.ns.cloudflare.com`, `fay.ns.cloudflare.com`

The GitHub Pages DNS records above were added to Cloudflare on 2026-04-25 with proxy disabled.
Public DNS should resolve to GitHub Pages for both `ronniewong.cc` and `www.ronniewong.cc`.

HTTPS enforcement is not enabled yet because GitHub has not finished provisioning the Pages
certificate. After GitHub reports the certificate is available, enable HTTPS enforcement in the
repository's Pages settings or through the Pages API.
