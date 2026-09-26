# How the on-chain verification works

The portfolio publishes my education, publication and work records in a form anyone can check for tampering, without trusting this website or GitHub.

1. **Records.** Each entry in [`credentials.json`](../credentials.json) is a small JSON object (id, type, title, issuer, date, details).
2. **Hashes.** Each record is serialised as compact JSON (UTF-8, no spaces) and hashed with SHA-256. These are the `leaves`.
3. **Merkle tree.** Leaves are paired and hashed together (`SHA-256(left || right)`) level by level until one value remains: the **Merkle root**. When a level has an odd number of nodes the last one is duplicated, as in Bitcoin.
4. **Bitcoin timestamp.** The root is written to [`proofs/merkle-root.txt`](../proofs/merkle-root.txt) and timestamped with [OpenTimestamps](https://opentimestamps.org). The proof file [`proofs/merkle-root.txt.ots`](../proofs/merkle-root.txt.ots) links that file's hash to a Bitcoin block header. Calendar servers aggregate many timestamps into one Bitcoin transaction, so this costs nothing and needs no wallet.
5. **In-browser check.** When the Verify section scrolls into view, `assets/js/verify.js` downloads `credentials.json`, recomputes every hash and the Merkle root with the browser's Web Crypto API, and compares the result with the anchored root. Change one character in any record and the check fails.

## Verify it yourself

- **On the website:** open the Verify section.
- **On opentimestamps.org:** drop `merkle-root.txt` and `merkle-root.txt.ots` on the page.
- **Command line:**

  ```bash
  pip install opentimestamps-client
  ots upgrade proofs/merkle-root.txt.ots   # once the Bitcoin transaction confirms
  ots verify  proofs/merkle-root.txt.ots
  ```

A fresh proof is *pending* until the calendars' Bitcoin transaction confirms (usually a few hours). Running `ots upgrade` afterwards embeds the full path to the block so the proof no longer depends on the calendar servers.

## What it proves, and what it doesn't

It proves the records existed in exactly this form on the timestamp date and have not been edited since. It does not prove the records are true: they are self-published, and an official transcript or letter from the issuer remains the authority.

## Updating the records

Edit `credentials.json`, recompute the leaves and root (the same algorithm as `verify.js`), write the new root to `proofs/merkle-root.txt`, and stamp it again with `ots stamp proofs/merkle-root.txt`.
