<template>
  <q-card>
    <q-img
      :src="printer.photos[0].photo_sm"
      :ratio="4 / 3"
      @click="$emit('view-click', printer.id)"
      :img-style="{ cursor: 'pointer' }"
    >
    </q-img>
    <q-list>
      <q-item class="q-py-sm">
        <q-item-section>
          <q-item-label>{{ printerDisplayName }}</q-item-label>
          <q-item-label caption v-if="printer.serial_number !== null"
            >{{ printerFamily.short_name }}.{{
              printer.serial_number
            }}</q-item-label
          >
        </q-item-section>
        <q-item-section avatar>
          <q-btn-dropdown
            dropdown-icon="more_vert"
            fab-mini
            flat
            no-icon-animation
          >
            <q-list>
              <q-item
                v-close-popup
                :to="{ name: 'printerUpdate', params: { id: printer.id } }"
              >
                <q-item-section avatar>
                  <q-icon name="edit" />
                </q-item-section>
                <q-item-section>
                  <q-item-label> Edit Printer</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                clickable
                @click="$emit('delete-click', printer.id)"
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon name="delete_forever" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label> Delete Printer</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                :to="{
                  name: 'printerConfigBackups',
                  params: { printerId: printer.id },
                }"
              >
                <q-item-section avatar>
                  <q-icon name="backup" />
                </q-item-section>
                <q-item-section>
                  <q-item-label> Config Backups </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
        <!-- <q-item-section side>
          <q-btn
            round
            size="sm"
            color="grey-7"
            icon="visibility"
            @click="$emit('view-click', printer.id)"
          >
            <q-tooltip>View</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section side>
          <q-btn
            round
            size="sm"
            color="grey-7"
            icon="edit"
            :to="`/update/${printer.id}`"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section side>
          <q-btn
            round
            size="sm"
            color="negative"
            icon="delete_forever"
            @click="$emit('delete-click', printer.id)"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-item-section> -->
      </q-item>
    </q-list>
  </q-card>
</template>
<style scoped>
.q-list--dense > .q-item,
.q-item--dense {
  min-height: 24px;
}
.q-item__label + .q-item__label {
  margin-top: 0px;
}

.card-swatch {
  margin-top: 0.1em;
  margin-left: 0.5em;
  width: 80%;
  aspect-ratio: 1;
  border: 1px solid silver;
}
div.q-img__content > div.photo-title {
  padding: 4px;
}
div.q-card {
  height: 100%;
}
</style>
<script>
import { defineComponent } from "vue";
import { v3ImgPreviewFn } from "v3-img-preview";
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core.js";

export default defineComponent({
  props: {
    printer: {
      required: true,
    },
  },
  methods: {
    handlePreview(e) {
      this.$emit("select", this.printer.id);
    },
  },
  computed: {
    ...mapStores(useCoreStore),
    printerDisplayName() {
      if (this.printer.printer_name) {
        return `${this.printer.printer_name} (${this.printerModel.model_name})`;
      }
      return this.printerModel.model_name;
    },
    printerModel() {
      return this.coreStore.models.get(this.printer.printer_model);
    },
    printerFamily() {
      return this.coreStore.families.get(this.printerModel.family_id);
    },
  },
});
</script>
