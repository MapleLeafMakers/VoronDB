<template>
  <div :class="cardSizeClasses">
    <q-card>
      <router-link :to="`/printer/${printer.vanity_url || printer.id}`">
        <q-img
          v-if="printer?.id"
          :src="printer.photos[0].photo_sm"
          :srcset="`${printer.photos[0].photo_sm} 640w, ${printer.photos[0].photo} 1080w`"
          :ratio="4 / 3"
          style="
            cursor: pointer;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
          "
        >
        </q-img>
      </router-link>
      <q-list dense>
        <q-item>
          <q-item-section avatar>
            <q-icon style="margin-left: 0.45em" :name="printerModel?.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ printerDisplayName }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label caption>{{ printerModel.model_name }}</q-item-label>
          </q-item-section>

          <q-item-section side v-if="printer.serial_number !== null">
            <q-item-label caption
              >{{ printerFamily.short_name }}.{{
                printer.serial_number
              }}</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item>
          <q-item-section avatar>
            <div
              class="card-swatch"
              :style="`background-color: ${this.frameColor?.color}`"
            ></div>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ frameColor?.color_name }}</q-item-label>
            <q-item-label caption>Frame</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="showFilamentCard(this.primaryFilament)">
          <q-item-section avatar>
            <div
              class="card-swatch filament"
              :style="`background-color: ${this.primaryFilament?.color}`"
            ></div>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ primaryFilament?.color_name }}</q-item-label>
            <q-item-label
              v-if="primaryFilament && primaryFilament?.manufacturer_id !== 1"
              caption
              >{{ primaryFilamentMfg.name }}
              {{ primaryFilamentType.name }}</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item clickable @click="showFilamentCard(this.accentFilament)">
          <q-item-section avatar>
            <div
              class="card-swatch filament"
              @click="showFilamentCard(this.accentFilament)"
              :style="`background-color: ${this.accentFilament?.color}`"
            ></div>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ accentFilament?.color_name }}</q-item-label>
            <q-item-label
              v-if="accentFilament && accentFilament?.manufacturer_id !== 1"
              caption
              >{{ accentFilamentMfg.name }}
              {{ accentFilamentType.name }}</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item class="q-py-none">
          <q-item-section>
            <q-item-label caption>
              {{ new Date(printer.submitted_at).toLocaleDateString() }}
              by
              <router-link
                v-if="printer?.submitted_by && linkSubmittedBy"
                :to="`/user/${printer?.submitted_by?.username}`"
                class="name-link"
              >
                {{ printer?.submitted_by?.username }}#{{
                  printer?.submitted_by?.discriminator
                }}
              </router-link>
              <span v-else>{{
                `${printer?.submitted_by?.username}#${printer?.submitted_by?.discriminator}` ||
                "anonymous"
              }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div>
              <q-btn
                size="sm"
                :disable="!coreStore.userData?.id && likeButtonEnabled"
                :color="printer.user_liked ? 'red' : null"
                flat
                icon="voron_heart"
                :label="printer.like_count"
                @click="handleLikeClick"
              >
              </q-btn>
              <q-tooltip v-if="printer.user_liked">Un-like</q-tooltip>
              <q-tooltip v-else-if="coreStore.userData?.id">Like</q-tooltip>
              <q-tooltip v-else>You are not signed in</q-tooltip>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>
<style lang="scss" scoped>
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
.card-swatch.filament {
  cursor: pointer;
}
div.q-img__content > div.photo-title {
  padding: 4px;
}
div.q-card {
  height: 100%;
}
.name-link {
  color: $primary;
}
.q-dark .name-link {
  color: $grey-3;
}
</style>
<script>
import { defineComponent } from "vue";
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core.js";
import FilamentCard from "components/FilamentCard.vue";

export default defineComponent({
  props: {
    displayMode: String,
    printer: {
      required: true,
    },
    linkSubmittedBy: { type: Boolean, default: true },
  },
  data() {
    return {
      likeButtonEnabled: true,
    };
  },
  methods: {
    showFilamentCard(filament) {
      this.$q.dialog({
        component: FilamentCard,
        componentProps: { filament: filament },
      });
    },
    handlePreview(e) {
      this.$emit("select", this.printer.id);
    },
    async handleLikeClick() {
      this.likeButtonEnabled = false;
      const resp = await this.$api.post(
        `/api/printer/${this.printer.id}/like/`,
        {
          like: !this.printer.user_liked,
        },
        { headers: { "X-CSRFToken": this.$q.cookies.get("csrftoken") } }
      );
      this.$emit("update-likes", this.printer.id, resp.data);
      this.likeButtonEnabled = true;
    },
  },
  computed: {
    ...mapStores(useCoreStore),
    printerDisplayName() {
      if (this.printer.printer_name) {
        return `${this.printer.printer_name}`;
      }
      return this.printerModel.model_name;
    },
    printerModel() {
      return this.coreStore.models.get(this.printer.printer_model);
    },
    printerFamily() {
      return this.coreStore.families.get(this.printerModel.family_id);
    },
    frameColor() {
      return this.coreStore.frameColors.get(this.printer.frame_color);
    },
    accentFilament() {
      return this.coreStore.filaments.get(this.printer.accent_filament);
    },
    accentFilamentType() {
      return this.coreStore.types.get(this.accentFilament.type_id);
    },
    accentFilamentMfg() {
      return this.coreStore.manufacturers.get(
        this.accentFilament.manufacturer_id
      );
    },
    primaryFilament() {
      return this.coreStore.filaments.get(this.printer.primary_filament);
    },
    primaryFilamentType() {
      return this.coreStore.types.get(this.primaryFilament.type_id);
    },
    primaryFilamentMfg() {
      return this.coreStore.manufacturers.get(
        this.primaryFilament.manufacturer_id
      );
    },
    cardSizeClasses() {
      if (this.displayMode == "dm-sm") {
        return "col-xs-12 col-sm-6 col-md-4 col-lg-3";
      } else {
        return "col-xs-12 col-md-12 col-lg-6";
      }
    },
  },
});
</script>
