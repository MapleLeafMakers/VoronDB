<template>
  <q-page padding>
    <PageHeader
      title="Submit Filament Information"
      caption="Use the form below to submit new filament information for the
          database. All submissions will be manually verified before they are
          visible on the site."
      icon="filament"
    />
    <q-table
      dense
      :rows="rows"
      :columns="columns"
      table-header-class="text-bold"
      row-key="id"
      hide-no-data
      hide-footer
      hide-pagination
      :rows-per-page-options="[0]"
      separator="cell"
      bordered
      class="q-mb-md"
    >
      <template v-slot:body-cell-rowNum="props">
        <q-td
          :props="props"
          :key="props.key"
          :class="['input-cell']"
          auto-width
        >
          {{ props.rowIndex + 1 }}
        </q-td>
      </template>
      <template v-slot:body-cell-manufacturer="props">
        <q-td
          :props="props"
          :key="props.key"
          :class="['input-cell', props.row.validation?.manufacturer]"
          auto-width
        >
          <BulkAddSelect
            :model-value="props.value"
            :options="manufacturerOptions"
            @update:model-value="(v) => updateManufacturer(props.row.id, v)"
            @blur="updateManufacturer(props.row.id, props.value)"
          ></BulkAddSelect>
        </q-td>
      </template>

      <template v-slot:body-cell-type="props">
        <q-td
          :props="props"
          :key="props.key"
          :class="['input-cell', props.row.validation?.type]"
          auto-width
        >
          <BulkAddSelect
            :model-value="props.value"
            :options="typeOptions"
            @update:model-value="(v) => updateType(props.row.id, v)"
            @blur="updateType(props.row.id, props.value)"
          ></BulkAddSelect>
        </q-td>
      </template>

      <template v-slot:body-cell-color_category="props">
        <q-td
          :props="props"
          :key="props.key"
          :class="[
            'input-cell',
            'input-cell-color-category',
            props.row.validation?.color_category,
          ]"
          auto-width
        >
          <q-select
            dense
            option-label="name"
            option-value="id"
            :options="colorCategoryOptions"
            :model-value="props.value"
            @blur="updateColorCategory(props.row.id, props.value)"
            @update:model-value="(v) => updateColorCategory(props.row.id, v)"
          >
            <template v-slot:prepend
              ><div
                v-if="props.value"
                class="swatch q-ml-md"
                :style="'background-color: ' + props.value?.color"
              ></div
            ></template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" dense>
                <q-item-section side>
                  <div
                    class="swatch swatch-option"
                    :style="'background-color: ' + scope.opt.color"
                  ></div>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-td>
      </template>

      <template v-slot:body-cell-color_name="props">
        <q-td
          :props="props"
          :key="props.key"
          :class="[
            'input-cell',
            'input-cell-color-name',
            props.row.validation?.color_name,
          ]"
          auto-width
        >
          <q-input
            dense
            class="q-px-md"
            square
            :model-value="props.value"
            @blur="updateColorName(props.row.id, props.value)"
            @update:model-value="(v) => updateColorName(props.row.id, v)"
          >
            <template v-slot:prepend><div style="width: 12px"></div></template>
          </q-input>
        </q-td>
      </template>

      <template v-slot:body-cell-source="props">
        <q-td
          :props="props"
          :key="props.key"
          :class="[
            'input-cell',
            'input-cell-source',
            props.row.validation?.source,
          ]"
          auto-width
        >
          <q-select
            dense
            transition-duration="0"
            square
            :options="sourceOptions"
            :model-value="props.value"
            @blur="updateSource(props.row.id, props.value)"
            @update:model-value="(v) => updateSource(props.row.id, v)"
          >
            <template v-slot:prepend><div style="width: 16px"></div></template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" dense>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.caption }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-td>
      </template>

      <template v-slot:body-cell-color="props">
        <q-td
          :props="props"
          :key="props.key"
          :class="[
            'input-cell',
            'input-cell-color',
            props.row.validation?.color,
          ]"
          auto-width
        >
          <ColorInput
            dense
            square
            :model-value="props.value"
            @update:model-value="(v) => updateColor(props.row.id, v)"
            @blur="updateColor(props.row.id, props.value)"
            class="q-px-md"
          >
          </ColorInput>
        </q-td>
      </template>
      <template v-slot:body-cell-delete="props">
        <q-td
          :props="props"
          :key="props.key"
          :class="['input-cell']"
          auto-width
        >
          <q-btn
            size="sm"
            square
            style="height: 100%; width: 100%"
            flat
            icon="delete"
            @click="removeRow(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <div class="row">
      <div class="col-6">
        <q-btn icon="add" label="Add row" @click="addRow" flat />
      </div>
      <div class="col-6 text-right">
        <q-btn
          icon="upload"
          label="Submit"
          @click="handleSubmit"
          color="positive"
        />
      </div>
    </div>
  </q-page>
</template>
<style lang="scss" scoped>
.q-table td.adding {
  background-color: $orange-1;
}
.q-table td.valid {
  background-color: $green-1;
}
.q-table td.invalid {
  background-color: $red-1;
}

.body--dark .q-table td.adding {
  background-color: $orange-10;
}
.body--dark .q-table td.valid {
  background-color: $green-10;
}
.body--dark .q-table td.invalid {
  background-color: $red-10;
}

.body--dark .text-caption {
  color: rgba(255, 255, 255, 0.5);
}

.q-table .q-td.input-cell {
  padding: 0px;
  position: relative;
}
.q-table .q-td.input-cell.input-cell-color-category {
  min-width: 12em;
}
.q-table .q-td.input-cell.input-cell-source {
  min-width: 18em;
}
.q-table .q-td.input-cell.input-cell-color-name {
  min-width: 18em;
}
.q-table .q-td.input-cell.input-cell-color {
  min-width: 18em;
}

.q-table--dense .q-table td:last-child {
  padding-right: 0px;
}

.q-table--dense .q-table td:first-child {
  padding-left: 0px;
}
label.q-field--dense.q-px-md {
  padding-left: 0px;
  padding-right: 0px;
}
.q-table th {
  font-weight: 1000;
  font-size: 16px;
}
.swatch {
  width: 1em;
  height: 1em;
  border: 1px solid silver;
  display: inline-block;
  flex-shrink: 0;
}
.swatch-option {
  width: 1.5em;
  height: 1.5em;
}
</style>
<script>
import { uid } from "quasar";
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";
import BulkAddSelect from "components/BulkAddSelect.vue";
import ColorInput from "components/ColorInput.vue";
import PageHeader from "components/PageHeader.vue";

export default {
  name: "AddFilamentPage",
  mounted() {
    this.colorCategoryOptions = Array.from(
      this.coreStore.genericFilaments.values()
    ).map((gf) => ({
      name: gf.color_name,
      id: gf.color_category_id,
      color: gf.color,
    }));
    this.manufacturerOptions = Array.from(
      this.coreStore.manufacturers.values()
    ).filter((m) => m.id !== 1);
    this.typeOptions = Array.from(this.coreStore.types.values()).filter(
      (t) => t.id
    );
  },
  components: { BulkAddSelect, ColorInput, PageHeader },
  computed: {
    ...mapStores(useCoreStore),
  },
  methods: {
    addRow() {
      const row = this.rows[this.rows.length - 1];
      if (row) {
        this.validateRow(row);
      }
      const newRow = { ...this.rows[this.rows.length - 1] };
      newRow.id++;
      newRow["validation"] = {};
      delete newRow["color"];
      delete newRow["color_category"];
      delete newRow["color_name"];
      this.rows.push(newRow);
    },
    updateManufacturer(rowId, value, row) {
      if (row === undefined) {
        row = this.rows.find((r) => r.id === rowId);
      }
      if (value.unsaved) {
        delete value.unsaved;
        this.manufacturerOptions.push(value);
        value = this.manufacturerOptions[this.manufacturerOptions.length - 1];
        this.manufacturerOptions.sort((a, b) => (a.name > b.name ? 1 : -1));
      }
      row.validation.manufacturer = value
        ? value.id === value.name
          ? "adding"
          : "valid"
        : "invalid";
      row.manufacturer = value;
    },
    updateType(rowId, value, row) {
      if (row === undefined) {
        row = this.rows.find((r) => r.id === rowId);
      }
      if (value.unsaved) {
        delete value.unsaved;
        this.typeOptions.push(value);
        value = this.typeOptions[this.typeOptions.length - 1];
        this.typeOptions.sort((a, b) => (a.name > b.name ? 1 : -1));
      }
      row.validation.type = value
        ? value.id === value.name
          ? "adding"
          : "valid"
        : "invalid";
      row.type = value;
    },
    updateColorCategory(rowId, value, row) {
      if (row === undefined) {
        row = this.rows.find((r) => r.id === rowId);
      }
      row.color_category = value;
      row.validation.color_category = value ? "valid" : "invalid";
    },
    updateColorName(rowId, value, row) {
      if (row === undefined) {
        row = this.rows.find((r) => r.id === rowId);
      }
      row.color_name = value;
      row.validation.color_name = value && value.trim() ? "valid" : "invalid";
    },
    updateColor(rowId, value, row) {
      if (row === undefined) {
        row = this.rows.find((r) => r.id === rowId);
      }
      row.color = value;
      row.validation.color = /^#[A-F0-9]{6}$/i.test(value)
        ? "valid"
        : "invalid";
    },
    updateSource(rowId, value, row) {
      if (row === undefined) {
        row = this.rows.find((r) => r.id === rowId);
      }
      row.source = value;
      row.validation.source = !!value ? "valid" : "invalid";
    },
    validateRow(row) {
      this.updateColor(row.id, row.color, row);
      this.updateColorCategory(row.id, row.color_category, row);
      this.updateManufacturer(row.id, row.manufacturer, row);
      this.updateType(row.id, row.type, row);
      this.updateSource(row.id, row.source, row);
      this.updateColorName(row.id, row.color_name, row);
    },
    removeRow(rowId) {
      this.rows = this.rows.filter((r) => r.id !== rowId);
    },
    async handleSubmit() {
      let errors = false;
      let rowNum = 0;
      for (let row of this.rows) {
        rowNum++;
        this.validateRow(row);
        for (const [key, value] of Object.entries(row.validation)) {
          if (value === "invalid") {
            errors = true;
          }
        }
      }
      if (errors) {
        this.$q.dialog({
          message:
            "There is missing or incorrect data in your submission, please correct the errors marked above and try again.",
        });
        return;
      }

      const data = this.rows.map((r) => ({
        color_category: r.color_category.id,
        color_name: r.color_name,
        source: r.source.value,
        color: r.color,
        manufacturer:
          r.manufacturer.id === r.manufacturer.name
            ? undefined
            : r.manufacturer.id,
        type: r.type.id === r.type.name ? undefined : r.type.id,
        manufacturer_name:
          r.manufacturer.id === r.manufacturer.name
            ? r.manufacturer.name
            : undefined,
        type_name: r.type.id === r.type.name ? r.type.name : undefined,
      }));
      console.log(data);
      try {
        const response = this.$api.post("/api/filament/", data, {
          headers: { "X-CSRFToken": this.$q.cookies.get("csrftoken") },
        });

        this.$q.notify({
          type: "positive",
          message: "Thanks for your submission!",
        });
        this.coreStore.loaded = false;
        this.coreStore.fetchData();
        this.$router.push("/filament");
      } catch (err) {
        if (err.response.data) {
          this.$q.dialog({ message: JSON.stringify(err.response.data) });
        }
      } finally {
        this.submitting = false;
      }
    },
  },
  data() {
    return {
      colorCategoryOptions: [],
      manufacturerOptions: [],
      addingManufacturers: [],
      addingTypes: [],
      typeOptions: [],
      columns: [
        { name: "rowNum", align: "center" },
        { label: "Manufacturer", field: "manufacturer", name: "manufacturer" },
        { label: "Material Type", field: "type", name: "type" },
        {
          label: "Color Category",
          field: "color_category",
          name: "color_category",
        },
        {
          label: "RGB Hex Code",
          field: "color",
          name: "color",
          headerStyle: "width: 10em",
        },
        { label: "Source", field: "source", name: "source" },
        { label: "Color Name", field: "color_name", name: "color_name" },
        { name: "delete", align: "center" },
      ],
      rows: [
        {
          id: 1,
          manufacturer: "",
          type: "",
          color_name: "",
          color_category: "",
          color: "",
          validation: {},
        },
      ],
      sourceOptions: [
        {
          value: "guess",
          label: "Best Guess",
          caption:
            "Your color code is just a guess (including comparison to online RAL / Pantone color charts)",
        },
        {
          value: "measurement",
          label: "Measurement",
          caption:
            "You used a tool such as a colorimeter to measure a printed filament sample",
        },
        {
          value: "datasheet",
          label: "Manufacturer Datasheet",
          caption: "The color code was provided by the filament manufacturer",
        },
        {
          value: "visual",
          label: "Visual comparison",
          caption:
            "A printed filament sample was compared to a reference (Pantone or RAL printed color chart or reference chip)",
        },
      ],
    };
  },
};
</script>
