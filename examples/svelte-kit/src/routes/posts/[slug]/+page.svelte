<script>
  let { data } = $props()
  let { post } = $derived(data)
</script>

<h1>{post.title}</h1>

{@html post.html}
