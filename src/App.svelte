<script>
  import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'
  import { NotPrivacyPolicy } from './lib/Errors.js'
  import saveAs from 'save-as'

  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`

  let code = ''
  let filename = ''
  let success = false
  let error = null
  let loading = false

  const reader = (file) => new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(fr.result)
    fr.onerror = (err) => rej(err)
    fr.readAsArrayBuffer(file)
  })

  const executeOrder66 = async (e) => {
    error = null
    loading = true
    await doTheMagic(e)
    setTimeout(() => loading = false, 800)
  }

  const doTheMagic = async (e) => {
    const file = e.target.files[0];
    const countPromises = [];
    try {
      const read = await reader(file)
      const loadedDocument = getDocument(read)
      const doc = await loadedDocument.promise

      const totalPageCount = doc.numPages;
      for (
        let currentPage = 1;
        currentPage <= totalPageCount;
        currentPage++
      ) {
        let page = doc.getPage(currentPage);
        countPromises.push(
          page.then((page) => page.getTextContent())
            .then((text) => text.items
              .map((s) => s.str)
              .join(' ').replaceAll('- ', '-')))}
      
      if (!countPromises.length) return

      const texts = await Promise.all(countPromises)

      const content = texts.join('').match(/(<p><\/p>).*<\/table>/)

      if (!content) {
        throw new NotPrivacyPolicy()
      }

      code = '<html><head><meta charset="UTF-8" /></head><body>'
      code += content[0]
      code += "</body></html>"

      const blob = new Blob([code], { type: 'text/html' })
      filename = `DG-PPG-code-${Date.now()}.html`
      saveAs(blob, filename)
      success = true
    } catch (e) {
      error = e.message
    }
  }
</script>

<main>
  {#if loading}
    <div class="loading"></div>
  {:else if error}
    <div class="circle circle--error">:(</div>
    <h1>An error has occurred</h1>
    <p class="error">{error}</p>
    <button on:click={() => error = null}>Try again</button>
  {:else if success}
    <div class="circle circle--success">✔</div>
    <h1>File converted successfully</h1>
    <p>The code area of your Privacy Policy was saved as a file with the name <strong>{filename}</strong></p>
    <button on:click={() => success = false}>Do another one</button>
  {:else }
    <label for="file-selector">Click here to select a file</label>
    <input id="file-selector" type="file" on:change={executeOrder66} class="sr-only" accept=".pdf" />
  {/if}
</main>

<style>
  h1 {
    max-width: 10ch;
  }

  button {
    display: flex;
    margin: 5rem 0;
    background-color: #36B2E8;
    font-size: 1.25rem;
    padding: 1em 1.5em;
    font-weight: 600;
    cursor: pointer;
    border: none;
    text-transform: uppercase;
  }

  label {
    background-color: #1685a3;
    padding: 1.5em;
    font-size: 2rem;
    cursor: pointer;
    box-shadow: 0 1rem .5rem -.75rem black;
  }

  .loading {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    border: 2rem solid #1685a3;
    border-right-color: transparent;
    border-bottom-color: transparent;
    animation: spin 1s infinite ease-in-out;
    margin: auto 0;
  }

  .circle {
    cursor: default;
    display: grid;
    place-items: center;
    width: 10rem;
    height: 10rem;
    border-radius: 50%;
    color: white;
    font-size: 5rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }

  .circle--success {
    background-color: #5BC88D;
  }

  .circle--error {
    background-color: #9E2B2F;
  }

  .sr-only {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    z-index: -100;
  }

  @keyframes spin {
    from {
      rotate: 0deg;
    }

    to {
      rotate: 720deg;
    }
  }
</style>
