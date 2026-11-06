# Publication preparation

Updated on 6 November 2026. Published preview and first catalogue package: **Code Block Studio 1.7.5**.

The [GitHub 1.7.5 prerelease](https://github.com/HumuHumuUK/codeblock-studio/releases/tag/v1.7.5) contains the installer, matching metadata, 77-example Markdown note, reviewed source ZIP and checksums. The matching Gitea release and all five attachments have been verified. [npm version 1.7.5](https://www.npmjs.com/package/joplin-plugin-code-block-studio) became publicly available at 22:05:41 UTC after the owner's browser approval. Its downloaded tarball is byte-identical to the reviewed original, including all six screenshots, installer and example note. Joplin catalogue ingestion remains pending.

The [GitHub 1.7.4 prerelease](https://github.com/HumuHumuUK/codeblock-studio/releases/tag/v1.7.4) contains the installer, matching metadata, 77-example Markdown note, reviewed source ZIP and checksums. The matching release is also retained in Gitea's `codeblock-studio-public` repository. Both use tag `v1.7.4` at reviewed public source `e813a2aa24abecde2f931fc2aa7285c7510182b3`; all five uploaded assets were downloaded and checksum-verified on both services. The preserved build metadata retains original commit `030fd2b73dfdf109352e7ef1cc94e990cd93ce69`, whose email-corrected replacement has exactly the same source tree. The release notes explain that mapping; no release payload was rebuilt or changed.

**Gitea, GitHub and the requested npm/Joplin catalogue publication are authorised.** Leonard requested the listing preview and then created and verified his npm account on 6 November 2026. The listing copy is in [PLUGIN-LISTING.md](PLUGIN-LISTING.md) and is applied to the 1.7.5 README/description. The owner enabled account 2FA and approved the exact package upload in npm's browser flow. The package name and plugin ID were absent from the public registries checked before submission; those checks did not reserve a name.

Gitea remains the primary development repository. The private-package guard was removed for the authorised 1.7.5 publication; there is still no automatic release or registry submission workflow. Keep passwords, recovery codes and access tokens outside the chat and repository; complete npm authentication in the owner's browser. Publish only the reviewed tarball built from the clean, independent public source commit.

## Prepared material

- [README](../README.md): public-facing introduction, features, supported languages, usage, how it works and compatibility limits.
- [Listing copy](PLUGIN-LISTING.md): short and full catalogue descriptions, credits and screenshot captions.
- [Credits](../CREDITS.md): Leonard Powers for concept/design; Ada (OpenAI Codex) for coding/implementation under Leonard's direction.
- Six registered screenshots in `docs/images/`, generated from actual plugin components and fictional examples. They cover code cards, formatting comparison, retro displays, BBC modes, language search and wrapping. They are labelled as component screenshots, not full Joplin window captures.
- Original 48px and 128px PNG icons, with editable SVG source in `assets/`.
- Built `.jpl`, catalogue metadata `.json` and checksums under `publish/`. The metadata includes `_publish_hash`; `_publish_commit` is populated only for a clean checkout, so uncommitted code is not attributed to an older commit.
- A package file allowlist excludes source workspaces, dependencies, historical releases, research archives and local validation records from the npm tarball.
- Optional support links use Leonard's [Ko-fi page](https://ko-fi.com/W4J72A4KLF). The README and npm package metadata contain the link; `.github/FUNDING.yml` configures GitHub's Sponsor button with `ko_fi: W4J72A4KLF`. No payment widget or runtime request is added to the plugin.

## Gitea first, then GitHub

Commit and push tested development changes to the private Gitea repository first. Export the intended source from that committed revision with `git archive`, review the export, and apply it to the existing public checkout while retaining its separate public history. Commit the reviewed public source locally, rebuild and validate from that clean public commit, then preserve the exact installer, metadata, source ZIP and checksums under `releases/vVERSION/` in Gitea before publishing the public commit, tag and matching assets on GitHub.

The private development history and public source history are intentionally separate. `.gitattributes` excludes private records from `git archive`; it does not filter files or history in a normal Git push. Do not configure a whole-repository push mirror from the private project. Gitea's [push mirroring documentation](https://docs.gitea.com/usage/repository/repo-mirror/#pushing-to-a-remote-repository) warns that it force-pushes and overwrites the destination.

### Manual Gitea public preparation

The GitHub repository has been imported into a separate Gitea repository named `codeblock-studio-public`, without pull mirroring. Its GitHub push mirror has an interval of `0` and commit-triggered sync disabled. The private `codeblock-studio` repository has no push mirror. Keep both histories separate.

This source update is deliberately manual. Do not add a private-to-public push mirror: it would copy private Git history as well as the current files. The preparation command creates a reviewed file export on top of the public repository's existing history, including the example Markdown note. GitHub synchronisation remains a separate manual action after the public Gitea push.

After committing, testing and pushing development changes to private Gitea, run this from the private checkout:

```sh
npm run prepare-public
```

The command fetches `origin/main` and exports that committed source using its `.gitattributes` exclusions. Local uncommitted and untracked work is not included. It derives the public Gitea URL by changing the origin repository name from `codeblock-studio` to `codeblock-studio-public`, clones its independent public history into a new `work/public-update-…/public/` directory, replaces the files and stages the complete proposed change, including deletions. It refuses known private paths and shared private/public root history. It does not commit, push, tag or synchronise a mirror; each run creates a fresh review checkout.

Each prepared public checkout sets its local Git email to `17731374+HumuHumuUK@users.noreply.github.com`, leaving the private checkout and global identity unchanged. Before committing, check `git var GIT_AUTHOR_IDENT` and `git var GIT_COMMITTER_IDENT` use that address. Keep GitHub's email privacy protection enabled. Make public-source edits in this checkout; Gitea's web editor uses the account's commit identity and can reintroduce a private email.

In the printed public checkout, review `git diff --cached`, commit the approved update and run the clean validation/build steps. After preserving the matching release files in private Gitea, push that public commit to its Gitea `origin` with `git push origin main`. Then use **Synchronize Now** in the `codeblock-studio-public` mirror settings to update GitHub. Review and push any intended public tag separately; the preparation command does not create one.

GitHub-only commits can be overwritten by the push mirror, so check for them before synchronising. Git mirroring carries commits, branches and tags; GitHub release descriptions and attached installers still require their separate publication step.

The initial GitHub previews were published before the corresponding Gitea update. The Gitea-first sequence above applies to subsequent publications; preserve those existing public commits and released bytes.

## GitHub source destination

The public source repository is [HumuHumuUK/codeblock-studio](https://github.com/HumuHumuUK/codeblock-studio), created on 5 November 2026. The package and plugin manifest use it for the homepage/source URLs.

The public repository starts from a reviewed source export, with fresh Git history. Do not push or mirror the private development repository's existing history: it retains historical local documentation and release archives that are excluded from source exports by `.gitattributes`. Keep the private Gitea remote unchanged.

For public releases, review and commit the exported source, then rebuild from that clean public commit. Publish the `.jpl`, metadata JSON, source archive and checksums as release assets. Until final live Joplin acceptance is complete, mark the GitHub release as a prerelease and describe its limits. GitHub hosting makes the source and manual installer available; the separate npm publication enables Joplin's catalogue importer.

## Joplin's current published route

The published generator documentation, including released generator **3.7.2**, describes npm discovery. The package name must begin with `joplin-plugin-`, its keywords must include `joplin-plugin`, and `publish/` must contain the installer and metadata JSON. This project now supplies those files and an `npm run dist` build alias.

Joplin does support screenshot metadata. Relative image paths require a GitHub repository URL for display on its plugin website; alternatively, screenshot entries can use publicly accessible image URLs. The manifest points to the GitHub source destination above, where the screenshots are included with the reviewed source.

There is also a newer direct GitHub submission implementation in Joplin's development tree. Its current target is `joplin/plugins-test`, while the released generator documentation still describes npm. Do not mistake that test workflow for an established production submission route. Recheck the official guidance when publication is authorised.

Sources checked on 5 November 2026:

- [Official generator publication guidance](https://github.com/laurent22/joplin/blob/dev/packages/generator-joplin/generators/app/templates/GENERATOR_DOC.md#publishing-the-plugin).
- [Official screenshot and icon specification](https://joplinapp.org/help/api/references/plugin_manifest/).
- [Official catalogue update workflow](https://github.com/joplin/plugins/blob/master/.github/workflows/update-repo.yml).
- [Development submission target](https://github.com/laurent22/joplin/blob/dev/packages/generator-joplin/generators/app/templates/script/publish/steps/submitPayload.ts).

## Checks before a stable release and catalogue publication

1. Finish live acceptance in Joplin with the exact candidate installer: first-click Format, toolbar/source double-click behaviour, both editor paths, linked scrolling, Apply, Cancel, both Copy actions and native Undo. Use disposable notes.
2. The 1.7.5 manifest requires Joplin Desktop 3.7.22, matching the Linux development checks, instead of the earlier unverified 3.3 declaration. Preserve the documented limits: Windows/macOS remain unverified and mobile is unsupported.
3. Check the public GitHub homepage/source URLs, repository-relative screenshots, release installer and Ko-fi support link.
4. Review the name, description, images, credits and licences. The name/ID was absent from the 393-entry official catalogue snapshot checked today, and npm returned 404 for the proposed package name; neither check reserves a name.
5. Run `npm ci`, `npm run typecheck`, `npm run dist`, `npm test`, `npm audit`, and `npm pack --dry-run --json --ignore-scripts`. Inspect the package contents, version fields and checksum. No publishing occurs in these commands.
6. Commit the agreed source and rebuild from that clean commit. Verify that `_publish_commit` matches it and that the installer hash matches `_publish_hash`. Preserve the approved installer bytes with its release notes and checksum.
7. Complete the owner's email verification and secure npm publishing authentication, then publish the exact reviewed public tarball under that account and check the resulting registry files. The private-package guard was removed for 1.7.5 as part of this authorised preparation. Confirm catalogue ingestion separately; npm publication alone does not prove that Joplin's next import has completed. Do not ask for general publication authorisation again solely because an earlier draft had publication on hold.

The project has no publish lifecycle script or automatic release workflow. `npm pack` is a local packaging operation; it is not publication.

npm now [scans uploads before they become available](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/). A successful upload can therefore precede the real version appearing in registry metadata. Do not repeatedly upload or change versions to work around that delay. Verify the version's published integrity and downloaded bytes against the preserved tarball, then check Joplin's catalogue separately. A temporary `0.0.0-stage` placeholder is not the installable plugin version; use `npm stage list` to distinguish a pending maintainer approval from an upload that is not in the staged queue.
