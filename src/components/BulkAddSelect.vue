<template>
  <q-select
    ref="qsel"
    dense
    square
    use-input
    fill-input
    hide-selected
    input-class="q-px-md"
    @input-value="(v) => setInputValue(v)"
    @filter="onFilter"
    option-label="name"
    option-value="id"
    :options="filteredOptions"
    :model-value="modelValue"
    @update:model-value="handleUpdate"
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
          <q-item-label
            caption
            v-if="scope.opt.id === scope.opt.name && scope.opt.unsaved"
            >Add {{ scope.opt.name }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
export default {
  name: "BulkAddSelect",
  props: ["modelValue", "label", "options"],
  data() {
    return {
      inputValue: "",
      filterValue: "",
    };
  },
  computed: {
    filteredOptions() {
      const filtered = this.options.filter(
        (o) =>
          o.name.toLowerCase().indexOf(this.filterValue.toLowerCase()) !== -1
      );
      if (
        this.filterValue &&
        this.modelValue?.name !== this.filterValue &&
        filtered.find(
          (o) => o.name.toLowerCase() === this.filterValue.toLowerCase()
        ) === undefined
      ) {
        filtered.unshift({
          name: this.filterValue,
          id: this.filterValue,
          unsaved: true,
        });
      }
      return filtered;
    },
  },
  mounted() {
    this.filteredOptions = [this.options];
  },
  methods: {
    handleUpdate(e) {
      this.$emit("update:modelValue", e);
    },
    setInputValue(v) {
      this.inputValue = v;
    },
    onFilter(val, update) {
      update(() => {
        this.filterValue = val;
      });
    },
  },
};
</script>
