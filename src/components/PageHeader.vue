<template>
  <div class="row flex items-center q-mb-sm no-wrap">
    <slot name="prepend"></slot>
    <q-icon class="q-mr-md" size="xl" :name="icon"></q-icon>
    <div>
      <span class="text-h4">{{ title }}</span>
      <p class="q-mb-none">
        {{ caption }}
      </p>
    </div>
    <slot name="append"></slot>
  </div>
</template>

<script>
export default {
  name: "PageHeader",
  props: {
    caption: { type: String },
    icon: { type: String },
    title: { type: String },
  },
};
</script>
