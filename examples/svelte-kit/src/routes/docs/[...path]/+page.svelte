<script>
  let { data } = $props()
  let { doc } = $derived(data)
</script>

<h1>{doc.title}</h1>

{@html doc.html}
