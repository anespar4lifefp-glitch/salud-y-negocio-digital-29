<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## App architecture
- Keep the public product showcase separate from checkout; direct purchases to the supplied official store until a payment provider is connected, so prices and fulfilment are not fabricated.
- Store educational article content in a browser-safe shared module and give each ebook its own route with printable output, so downloadable education stays reviewable and does not require inference.
- Use the uploaded artwork's original logo and storefront crops without redrawing branding; keep uploaded media as asset pointers.
- Keep manual receiving-wallet information separate from official product checkout and never imply transaction verification without a verified payment integration.
- Use a public server function for single-shot educational catalog selection, with strict allowlisted IDs and a clinical-concern safety gate; never display free-form model medical advice or persist visitor wellness text.
- Encode only the exact receiving address in the QR, with a quiet zone and explicit network label; never encode a transfer amount or initiate transactions.
