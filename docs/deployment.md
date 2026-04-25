# Deployment

## GitHub Pages

- Repository: https://github.com/qoli/RonnieCC
- Source: `main` branch, `/` root
- Custom domain: `ronnie.cc`
- CNAME file: `/CNAME`

GitHub Pages has been configured through the GitHub API. The page currently redirects the default
`qoli.github.io/RonnieCC` URL to `ronnie.cc`, so the live domain must have correct DNS before the
site is reachable through the custom domain.

## DNS Target

For `ronnie.cc` as an apex domain, configure these DNS records:

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

## Current Blocker

As of 2026-04-25, public DNS for `ronnie.cc` is still on Namecheap nameservers:

- `dns1.registrar-servers.com`
- `dns2.registrar-servers.com`

The Cloudflare API account available to Codex currently has the `ronniewong.cc` zone but not
`ronnie.cc`, and its token does not have permission to create a new Cloudflare zone. To finish the
Cloudflare setup, add `ronnie.cc` to Cloudflare with an API token/account that has zone creation
rights, then update the domain's nameservers at Namecheap to the nameservers Cloudflare assigns.

After DNS resolves to GitHub Pages, enable HTTPS enforcement in GitHub Pages settings.
