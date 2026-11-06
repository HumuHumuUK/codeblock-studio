# Publication preparation

Updated on 6 November 2026. Published preview: **Code Block Studio 1.7.4**.

The [GitHub 1.7.4 prerelease](https://github.com/HumuHumuUK/codeblock-studio/releases/tag/v1.7.4) contains the installer, matching metadata, 77-example Markdown note, reviewed source ZIP and checksums. The matching release is also retained in Gitea's `codeblock-studio-public` repository. Both use tag `v1.7.4` at reviewed public source `e813a2aa24abecde2f931fc2aa7285c7510182b3`; all five uploaded assets were downloaded and checksum-verified on both services. The preserved build metadata retains original commit `030fd2b73dfdf109352e7ef1cc94e990cd93ce69`, whose email-corrected replacement has exactly the same source tree. The release notes explain that mapping; no release payload was rebuilt or changed.

**Gitea and GitHub source publication are authorised; npm and Joplin catalogue publication remain on hold.** Gitea is the primary development repository. Leonard requested public hosting under `HumuHumuUK` and supplied the Ko-fi support URL. The package remains `private: true`, so public GitHub hosting does not enable npm publication. There is no automatic release or registry submission workflow.

## Prepared material

- [README](../README.md): public-facing introduction, features, supported languages, usage, how it works and compatibility limits.
- [Listing copy](PLUGIN-LISTING.md): short and full catalogue descriptions, credits and screenshot captions.
- [Credits](../CREDITS.md): Leonard Powers for concept/design; Ada (OpenAI Codex) for coding/implementation under Leonard's direction.
- Three screenshots in `docs/images/`, generated from actual plugin components and fictional examples. `npm run screenshots` refreshes them after a build. They are labelled as component screenshots, not full Joplin window captures.
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

For public releases, review and commit the exported source, then rebuild from that clean public commit. Publish the `.jpl`, metadata JSON, source archive and checksums as release assets. Until final live Joplin acceptance is complete, mark the release as a prerelease and describe its limits. GitHub hosting makes the source and manual installer available; it does not itself submit the plugin to Joplin's catalogue. npm publication remains disabled by `private: true`.

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
2. Confirm the supported minimum Joplin version. The manifest retains the earlier `3.3` declaration; historical live checks cover 3.7.22 on Linux. Either test 3.3 or choose an accurately tested minimum. Windows and macOS remain unverified, and mobile is not supported.
3. Check the public GitHub homepage/source URLs, repository-relative screenshots, release installer and Ko-fi support link.
4. Review the name, description, images, credits and licences. The name/ID was absent from the 393-entry official catalogue snapshot checked today, and npm returned 404 for the proposed package name; neither check reserves a name.
5. Run `npm ci`, `npm run typecheck`, `npm run dist`, `npm test`, `npm audit`, and `npm pack --dry-run --json --ignore-scripts`. Inspect the package contents, version fields and checksum. No publishing occurs in these commands.
6. Commit the agreed source and rebuild from that clean commit. Verify that `_publish_commit` matches it and that the installer hash matches `_publish_hash`. Preserve the approved installer bytes with its release notes and checksum.
7. Obtain Leonard's explicit instruction to publish to npm and the Joplin catalogue. Only then remove `private: true`, use the authorised publishing account and follow the production route confirmed at that time. Review the package once more immediately before publishing.

The project has no publish lifecycle script or automatic release workflow. `npm pack` is a local packaging operation; it is not publication.
