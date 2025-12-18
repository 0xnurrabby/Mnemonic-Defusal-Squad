# Mnemonic Defusal Squad (Farcaster Mini App)

Domain (hard-coded): https://nurrabby.com/

## Deploy
Deploy as a static site where these paths are served exactly:
- https://nurrabby.com/  -> /index.html
- https://nurrabby.com/.well-known/farcaster.json
- https://nurrabby.com/assets/embed-3x2.png
- https://nurrabby.com/assets/icon-1024.png
- https://nurrabby.com/assets/splash-200.png

## Tip configuration (required to enable sending)
In `app.js`:
- Replace `const BUILDER_CODE = "TODO_REPLACE_BUILDER_CODE";`
- Replace `const RECIPIENT = "0x1111111111111111111111111111111111111111";` with a checksummed address.

Until BUILDER_CODE is replaced, the Tip button will open the sheet but sending is disabled (with a toast).
