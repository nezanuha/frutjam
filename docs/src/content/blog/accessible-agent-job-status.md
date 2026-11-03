---
title: "Job status views with Frutjam and HTMX"
description: "Build a manual job-status view that separates observed progress from a confirmed result."
metaTitle: "Job status views with Frutjam and HTMX | Frutjam"
metaDescription: "Use Frutjam and HTMX to refresh a job view, preserve controls, handle uncertainty and distinguish progress from a confirmed result."
createdAt: "2026-10-27T01:00:52+04:00"
updatedAt: "2026-11-03T18:07:38.799+04:00"
draft: true
author: "Tejesh Vaish"
authorUrl: "https://www.tejeshvaish.com/"
---

The bar in this word counter reaches three of three before the result is confirmed. In the recorded demo, the page still said "confirming result" at that point. A later refresh showed the confirmed total of six words.

Each refresh asks the server for another snapshot. HTMX swaps that HTML into the card without replacing the controls; Frutjam styles the card, buttons, badges, and native HTML progress element.

Queued, running, and completed describe the job itself. The fourth view, uncertain, means the page could not read the job's current state.

| View | Shows | Doesn't prove |
| --- | --- | --- |
| Queued | This job's snapshot says `queued`. | The worker has started. |
| Running | Snapshot reports `running` and the input count. | Completion, even at 3 of 3. |
| Uncertain | The latest status read failed. | Worker failure, cancellation or permission to restart. |
| Completed | Successful response with a matching, validated result. | That a later read can still confirm it. |

Before a job is created, the page says "Not started". If the worker fails, the server logs a separate error and makes status reads fail explicitly.

## Run the example

The example requires Node.js 26.3.0 exactly and bundles Frutjam 2.3.0 and HTMX 2.0.8. Other versions were not tested. Setup also needs a POSIX shell and Git.

From an empty working directory, clone the [example repository](https://github.com/tridev-tej/technical-blog-examples/tree/005c62af00ce3cac768dc6e1e5d551fcc246859a) and check out the pinned commit:

```sh
sh -eu <<'SH'
node -e '
if (process.version !== "v26.3.0") {
  console.error(
    "This example requires Node.js v26.3.0; found " + process.version
  );
  process.exit(1);
}
'
git clone https://github.com/tridev-tej/technical-blog-examples.git
cd technical-blog-examples
git checkout --detach 005c62af00ce3cac768dc6e1e5d551fcc246859a
cd frutjam-job-status
node server.mjs
SH
```

Open `http://127.0.0.1:8787/` and choose **Refresh status** before starting a job. In a fresh server process, this gives you the missing-job response.

Choose **Start demo**, then use **Refresh status** to follow the count. The three-of-three view with "confirming result" lasts two seconds, so manual refreshes can miss it. When a refresh shows the confirmed total of six, note the UUID.

Choose **Simulate unavailable status** to replace the snapshot with uncertain, then **Refresh status** to recover the same UUID. Page updates are manual, with no automatic retry or background refresh.

The synthetic worker counts words in `red jam`, `green apple`, and `blue berry`, with no model call. Each input has two words, giving counts of `[2, 2, 2]` and a total of six. It waits two seconds in queued, counts one input every two seconds, and remains running for two more seconds after the third. Those delays give you time to inspect the transitions; they are not an ETA or a performance measurement.

The `frutjam-job-status` directory contains the complete `server.mjs`, `index.html`, and `verify.mjs`, along with the pinned Frutjam and HTMX assets. Because the server uses Node built-ins, you don't need a package installation or build step.

## Refresh the same job

`server.mjs` keeps one job in memory, and only `POST /jobs/demo` creates it. The guard creates the job before awaiting a snapshot, so another request in this process finds it already there:

```js
async function start(response) {
  const status = job ? 200 : 202;
  if (!job) createJob();
  send(response, status, await snapshot(job), 'text/html; charset=utf-8');
}
```

`createJob()` assigns the UUID synchronously before calling the asynchronous worker. The rejection handler sets a separate error state and logs any worker failure:

```js
function createJob() {
  job = { jobID: randomUUID(), state: 'queued', counts: [] };
  log('created', { jobID: job.jobID });
  worker(job).catch(error => {
    job.state = 'error';
    log('worker-error', { jobID: job.jobID, error: error.message });
  });
}
```

On a successful snapshot, the first POST returns 202 and later POSTs return the same job with 200. Choosing **Start demo** again in this process keeps the existing job.

If the worker has failed or a completed result fails validation, the server cannot return the snapshot. The outer error handler returns 500.

The guard has no knowledge of other server processes. Each has its own in-memory variable and can create a job, so repeated POSTs across servers can duplicate the work.

A status request has no creation step. `GET /jobs/demo/status` returns 404 if no job has been created or the supplied UUID is unknown.

To keep later requests tied to the same job, `afterSwap()` captures the UUID from each successful snapshot swap. `configure()` adds that ID to later requests, including **Refresh status**.

These handlers and listeners are in `index.html`:

```js
  function configure(event) {
    if (knownJobID) event.detail.parameters.jobID = knownJobID;
  }

  function afterSwap() {
    const snapshot = view.querySelector('[data-job-id]');
    knownJobID = snapshot.dataset.jobId;
    delete view.dataset.observation;
    say(view.querySelector('[data-summary]').textContent);
    view.setAttribute('aria-busy', 'false');
  }
  controls.addEventListener('htmx:configRequest', configure);
  controls.addEventListener('htmx:beforeRequest', beforeRequest);
  document.body.addEventListener('htmx:afterSwap', afterSwap);
  controls.addEventListener('htmx:afterRequest', afterRequest);
```

Before a control sends a request, `beforeRequest()` marks `#job-view` with `aria-busy="true"`. The persistent status text changes through `say()`, which leaves it alone when the new text matches the old text.

A GET without a UUID can also read the process's existing job. Page and status responses send `Cache-Control: no-store`, telling the browser not to cache them.

GET only observes: it cannot create, restart, or repair a job. If a completed result file is missing, corrupt, or for another UUID, validation fails and the status read returns 500.

## Separate progress from completion

The input count drives the bar. At three counted inputs, a running job still says "confirming result"; `snapshot()` only shows a result in its completed branch:

```js
async function snapshot(current) {
  if (current.state === 'error') throw new Error('Worker failed; inspect server events');
  const colors = { queued: 'neutral', running: 'info', completed: 'success' };
  const count = current.counts.length;
  let summary = `${current.state}: ${count} of 3 inputs counted.`;
  let resultText = 'Result not confirmed.';
  if (current.state === 'completed') {
    const result = await confirmedResult(current);
    summary = 'Completed: confirmed total ' + result.total + ' words.';
    resultText = `Counts: ${result.counts.join(', ')}. Total: ${result.total}.`;
  } else if (count === 3) {
    summary = 'Running: 3 of 3 inputs counted; confirming result.';
  }
  return `<div data-job-id="${current.jobID}" data-state="${current.state}" data-count="${count}">
  <p><span class="badge badge-${colors[current.state]}">${current.state}</span></p>
  <p>Job ID: <code>${current.jobID}</code></p>
  <p data-summary>${summary}</p>
  <label for="input-progress">Inputs counted</label>
  <progress id="input-progress" class="progress progress-primary" value="${count}" max="3">${count} of 3</progress>
  <p>${count} of 3 inputs counted. ${resultText}</p>
</div>`;
}
```

The state selects `badge-neutral`, `badge-info`, or `badge-success`. For the native progress element, `progress progress-primary` supplies the styling, `value` holds the input count, and `max="3"` sets the scale. Filling that bar does not select the completed badge or expose a result.

`confirmedResult()` reads the result file and validates the whole object against this job's UUID, exact counts `[2, 2, 2]`, and total of six. The worker must pass it before marking the job completed, and `snapshot()` must pass it again for each completed response:

```js
async function confirmedResult(current) {
  const result = JSON.parse(await readFile(resultPath(current.jobID), 'utf8'));
  assert.deepEqual(result, { jobID: current.jobID, counts: [2, 2, 2], total: 6 });
  return result;
}
```

The worker's first check comes after writing a temporary file and renaming it. A successful rename alone cannot confirm completion:

```js
  const total = current.counts.reduce((sum, count) => sum + count, 0);
  const result = { jobID: current.jobID, counts: current.counts, total };
  await writeFile(resultPath(current.jobID, '.tmp'), JSON.stringify(result));
  await rename(resultPath(current.jobID, '.tmp'), resultPath(current.jobID));
  await confirmedResult(current);
  current.state = 'completed';
  log('result-confirmed', { jobID: current.jobID });
```

The worker can finish even if you never refresh the page; displayed progress has no control over execution. Readback through these local [filesystem operations](https://nodejs.org/download/release/v26.3.0/docs/api/fs.html) checks this process's result. It does not establish crash or power-loss durability.

For the bar to be visible, the page also needs one CSS token. The pinned Frutjam 2.3.0 stylesheet sets progress height to `calc(var(--spacing) * 2)` without defining `--spacing`. Set it in the page's style block:

```css
    :root { --spacing: 0.25rem; }
```

Historical Chrome checks measured a zero-height track without that token. With it, desktop and mobile captures showed an 8px track, including a full 3 of 3 view that still had a running badge and "confirming result".

This standalone stylesheet works without a Tailwind build; the [installation guide](https://frutjam.com/docs/installation) covers that setup. The class tables for [Button](https://frutjam.com/components/button), [Card](https://frutjam.com/components/card), [Badge](https://frutjam.com/components/badge), and [Progress](https://frutjam.com/components/progress) document the component classes used here. The page's layout rules use element and ID selectors.

## Keep controls outside the swapped view

A refresh replaces only the children of `#job-view`, using HTMX's `innerHTML` swap. All three buttons and the persistent status message sit outside that target, so updating the snapshot leaves the control you used in place:

```html
  <div id="job-controls"
    hx-target="#job-view" hx-swap="innerHTML"
    hx-sync="#job-controls:drop" hx-request='{"timeout":2500}'>
    <button id="start-job" type="button"
      class="btn btn-primary" hx-post="/jobs/demo"
    >Start demo</button>
    <button id="refresh-job" type="button"
      class="btn" hx-get="/jobs/demo/status"
    >Refresh status</button>
    <button id="unavailable-job" type="button" class="btn"
      hx-get="/jobs/demo/status?unavailable=1"
    >Simulate unavailable status</button>
  </div>
  <p id="status-message" role="status"
    aria-atomic="true">Not started. Start demo creates one job.</p>
  <section class="card" aria-labelledby="job-heading">
    <div class="card-content">
      <h2 id="job-heading" class="card-title">Current observation</h2>
      <div id="job-view" aria-busy="false"><p>Not started.</p></div>
    </div>
  </section>
```

The card wrapper also stays in place. When HTMX inserts new badges and progress elements, the loaded CSS styles them; these components have no Frutjam JavaScript instance to reinitialize.

The shared [`hx-sync="#job-controls:drop"`](https://htmx.org/attributes/hx-sync/) drops overlapping requests from these page controls. The server's separate creation guard handles concurrent POSTs from other clients within the same process. The page controls also set a 2500ms request timeout.

There are no links or buttons inside the swapped snapshot. The page never calls `focus()` or disables the active button. Historical Chrome checks used Tab and Enter and found that the same connected button node retained focus through updates and failed reads.

The markup uses a named section, native buttons, and a labeled progress element with text counts. The persistent `role="status"` container is present before the first update. Its explicit `aria-atomic="true"` follows [W3C ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22).

A check with Orca 42.0 recorded all seven expected status messages across the full tested job flow. Speech clarity was not assessed. Orca required a forced stop during cleanup. General accessibility and WCAG compliance remain unverified.

## Recover failed status reads

After creation, **Simulate unavailable status** makes a real GET that returns HTTP 503 and leaves the worker unchanged. **Refresh status** remains available so you can ask for a new observation.

On `htmx:afterRequest`, `afterRequest()` clears busy state and calls `failed()` when `xhr.status` is `0` or at least `400`. [HTMX 2.0.8's source](https://raw.githubusercontent.com/bigskysoftware/htmx/v2.0.8/src/htmx.js) handles transport failures differently from HTTP responses, so checking `detail.failed` alone would miss failures.

If the **Start demo** request fails, the page cannot assume that creation failed too. The job may have started before its response was lost, leaving the page without a UUID. `failed()` warns you about that possibility and points you to **Refresh status** to find the job.

For the other controls, 404 means this process has no matching job: the process may have restarted, or the UUID may be unknown. A 500 means the server cannot confirm the job and asks you to inspect server events. Other failures ask for another refresh and state that work was not restarted.

`failed()` replaces the old snapshot and bar with an uncertain badge and the chosen message, then clears busy state. Removing the old bar keeps stale progress out of the failed observation:

```js
    const badge = document.createElement('span');
    badge.className = 'badge badge-warning';
    badge.textContent = 'uncertain';
    const detail = document.createElement('p');
    detail.textContent = text;
    view.replaceChildren(badge, detail);
    view.dataset.observation = 'uncertain';
    say(text);
    view.setAttribute('aria-busy', 'false');
```

Uncertain does not prove that the worker failed or stopped, so it cannot justify an automatic POST retry. The next successful swap removes the uncertainty marker and updates the persistent summary.

## Verify the result and recovery

Stop the manually started server with Ctrl+C before running the checker. It starts its own server on the same fixed port, 8787. In another terminal, from the directory containing the clone, run:

```sh
cd technical-blog-examples/frutjam-job-status
node verify.mjs
```

If the checks succeed, the final JSON record has `checks` set to `PASS`.

The checker exercises GET responses before creation, concurrent POSTs, UUID continuity, unavailable observations, and the full-bar interval. It checks exact file contents, missing or corrupt results, and an empty process after restart. To force a worker write failure, it makes the temporary result path a directory. It also reads server events independently of HTML and waits for result confirmation without requesting status.

The checker covers HTTP responses and result files; it does not check browser focus or speech.

A restart loses the in-memory job even if its old result files remain. This demo has no authentication, user isolation, cancellation, production queue, retry policy, deployment recipe, or no-JavaScript path. Design those parts before using the pattern in an application.

Show the inputs counted so far, and reserve completed for a result you have read and validated. After a failed status read, **Refresh status** should check the same job again.
