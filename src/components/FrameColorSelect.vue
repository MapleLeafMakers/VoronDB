<template>
  <q-select
    filled
    :model-value="modelValue"
    @update:model-value="handleUpdate"
    :options="Array.from(coreStore.frameColors.values())"
    label="Frame Color"
    lazy-rules="ondemand"
    clearable
  >
    <template v-slot:selected-item="scope">
      <div class="flex">
        <div
          class="swatch q-mr-sm"
          :style="'background-color: ' + scope.opt.color"
        ></div>
        <span>{{ scope.opt.color_name }}</span>
      </div>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" dense>
        <q-item-section side>
          <div
            class="swatch"
            :style="'background-color: ' + scope.opt.color"
          ></div>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.color_name }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
<style scoped>
.swatch {
  width: 1.5em;
  height: 1.5em;
  border: 1px solid silver;
  display: inline-block;
  flex-shrink: 0;
}
</style>

<script>
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";

export default {
  name: "FrameColorSelect",
  props: ["modelValue"],
  computed: {
    ...mapStores(useCoreStore),
  },
  methods: {
    handleUpdate(e) {
      this.$emit("update:modelValue", e);
    },
  },
  setup() {
    return {};
  },
};
</script>
