<template>
  <div>
    <q-table
      title="CSV Importer"
      :rows="rows"
      :columns="columns"
      row-key="id"
      :rows-per-page-options="[0]"
      separator="cell"
    >
      <template v-slot:header-cell="props">
        <q-th :key="props.col.field" :props="props">
          <q-select
            dense
            borderless
            v-if="props.col.field !== undefined"
            :options="unusedOptions"
            clearable
            :model-value="
              mappingOptions.find((o) => o.value === props.col.mapping)
            "
            @update:model-value="(v) => setColumnMapping(props.col, v)"
          />
        </q-th>
      </template>
      <template v-slot:body-cell="props">
        <q-td
          :key="props.key"
          :props="props"
          :class="
            getValidationClass(props.row[`${props.col.field}-validation`])
          "
        >
          <q-btn
            v-if="props.col.name === 'delete'"
            icon="delete"
            flat
            round
            size="sm"
            @click="deleteRow(props.rowIndex)"
          />
          <div v-else>
            <q-select
              v-if="props.col.mapping === 'color_category'"
              :options="
                Array.from(coreStore.genericFilaments.values()).map(
                  (f) => f.color_name
                )
              "
              dense
              borderless
              :model-value="props.value"
              @update:model-value="
                (v) => updateCell(props.row.id, props.col.field, v)
              "
            />
            <q-select
              v-else-if="props.col.mapping === 'manufacturer'"
              :options="manufacturerOptions"
              dense
              borderless
              :model-value="props.value"
              @update:model-value="
                (v) => updateCell(props.row.id, props.col.field, v)
              "
            >
            </q-select>
            <q-select
              v-else-if="props.col.mapping === 'type'"
              :options="
                Array.from(coreStore.types.values())
                  .filter((t) => t.id !== 1)
                  .map((t) => t.name)
              "
              dense
              borderless
              :model-value="props.value"
              @update:model-value="
                (v) => updateCell(props.row.id, props.col.field, v)
              "
            />
            <q-input
              v-else
              dense
              borderless
              debounce="500"
              :model-value="props.value"
              @update:model-value="
                (v) => updateCell(props.row.id, props.col.field, v)
              "
            />
          </div>
        </q-td>
      </template>
    </q-table>
    <pre>{{ csv }}</pre>
  </div>
</template>
<script>
import { uid } from "quasar";

import Papa from "papaparse";
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";
export default {
  props: { csv: { type: String, default: "", required: false } },
  name: "FilamentCSV",
  watch: {
    csv(newVal) {
      const data = Papa.parse(newVal, { skipEmptyLines: true }).data;
      this.columns = [{ name: "delete", label: "Delete" }];
      this.rows = [];
      let colsDone = false;
      let rowId = 0;
      for (let row of data) {
        const rowVal = { id: rowId++ };
        let i = 1;
        for (let col of row) {
          rowVal[`col${i}`] = col;
          rowVal[`col${i}-validation`] = null;
          if (!colsDone) {
            this.columns.push({
              name: `col${i}`,
              field: `col${i}`,
              label: "Unused Column",
              mapping: null,
            });
          }
          i++;
        }
        console.log(rowVal);
        this.rows.push(rowVal);
        colsDone = true;
      }
    },
  },
  mounted() {
    this.manufacturerOptions = Array.from(this.coreStore.manufacturers.values())
      .filter((m) => m.id !== 1)
      .map((m) => m.name);
  },
  data() {
    return {
      rows: [],
      columns: [],
      manufacturerOptions: [],
      typeOptions: [],
      mappingOptions: [
        {
          label: "[Remove Column]",
          value: "remove",
        },
        {
          label: "Color Category",
          value: "color_category",
          validatorFunc: (v) => {
            const match = Array.from(
              this.coreStore.genericFilaments.values()
            ).find((c) => c.color_name.toLowerCase() === v?.toLowerCase());
            if (!match) {
              return [v, false];
            }
            return [match.color_name, true];
          },
        },
        {
          label: "Color Name",
          value: "color_name",
          validatorFunc: (v) => [v, true],
        },
        {
          label: "Hex",
          value: "color",
          validatorFunc: (v) => {
            if (/^#?[0-9A-F]{6}$/i.test(v)) {
              return [`#${v.replace("#", "").toUpperCase()}`, true];
            } else {
              return [v, false];
            }
          },
        },
        {
          label: "Material Type",
          value: "type",
          validatorFunc: (v) => {
            const match = Array.from(this.coreStore.types.values()).find(
              (c) => c.name.toLowerCase() === v.toLowerCase()
            );
            if (!match) {
              return [v, false];
            }
            return [match.name, true];
          },
        },
        {
          label: "Manufacturer",
          value: "manufacturer",
          validatorFunc: (v) => {
            const match = this.manufacturerOptions.find(
              (m) => m.toLowerCase() === v.toLowerCase()
            );
            if (!match) {
              return [v, false];
            }
            return [match, true];
          },
        },
      ],
    };
  },
  computed: {
    ...mapStores(useCoreStore),
    unusedOptions() {
      return this.mappingOptions.filter((opt) => {
        return this.columns.findIndex((c) => c.mapping === opt.value) === -1;
      });
    },
  },
  methods: {
    addManufacturer(mfgName) {
      this.manufacturerOptions.push(mfgName);
      this.validateColumn(
        this.columns.find((c) => c.mapping === "manufacturer").field
      );
    },
    getValidationClass(validationValue) {
      if (validationValue === true) {
        return "bg-green-2";
      } else if (validationValue === false) {
        return "bg-red-2";
      }
    },
    setColumnMapping(col, mapping) {
      console.log(mapping);
      if (mapping?.value === "remove") {
        this.columns = this.columns.filter((c) => c.field !== col.field);
        return;
      }

      let columns = [];
      for (let c of this.columns) {
        if (c.field === col.field) {
          if (mapping !== null) {
            c.mapping = mapping.value;
          } else {
            c.mapping = null;
          }
        }
        columns.push({ ...c });
      }
      this.columns = columns;
      this.validateColumn(col.field);
    },
    validateColumn(fieldName) {
      const column = this.columns.find((c) => c.field === fieldName);
      let validatorFunc = (v) => [v, undefined];
      if (column.mapping) {
        const mapping = this.mappingOptions.find(
          (o) => o.value === column.mapping
        );
        validatorFunc = mapping.validatorFunc;
      }
      for (let row of this.rows) {
        let [value, valid] = validatorFunc(row[fieldName], row, column);
        row[fieldName] = value;
        row[`${fieldName}-validation`] = valid;
      }
    },
    deleteRow(rowIndex) {
      this.rows.splice(rowIndex, 1);
    },
    removeColumn(colObj) {
      const idx = this.columns.findIndex((c) => c.field === colObj.field);
      if (idx !== -1) {
        console.log("found at ", idx);
        this.columns.splice(idx, 1);
      }
    },
    updateCell(rowId, field, val) {
      const row = this.rows.find((r) => r.id === rowId);
      console.log("updating", row, "with", field, val);
      row[field] = val;
      this.validateColumn(field);
    },
  },
};
</script>
