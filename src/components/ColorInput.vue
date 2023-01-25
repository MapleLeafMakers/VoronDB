<template>
  <q-input
    dense
    square
    :model-value="modelValue"
    @update:model-value="handleUpdate"
  >
    <template v-slot:prepend>
      <div style="width: 12px"></div>
      <div
        v-if="modelValue"
        class="swatch"
        :style="'background-color: ' + modelValue"
      ></div>
    </template>
    <template v-slot:append>
      <q-icon name="colorize" class="cursor-pointer q-mr-sm">
        <q-popup-proxy transition-show="scale" transition-hide="scale">
          <q-color
            no-header-tabs
            no-header
            no-footer
            :model-value="modelValue"
            @update:model-value="handleUpdate"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
<style lang="scss" scoped>
.swatch {
  width: 1em;
  height: 1em;
  border: 1px solid silver;
  display: inline-block;
  flex-shrink: 0;
}
</style>
<script>
export default {
  name: "ColorInput",
  props: ["model-value"],
  methods: {
    handleUpdate(v) {
      this.$emit("update:model-value", v);
    },
  },
};
</script>
