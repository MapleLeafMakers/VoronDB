<template>
  <q-form
    greedy
    class="q-gutter-xs"
    v-if="coreStore.loaded"
    @submit="handleSubmit"
  >
    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-sm-12 col-md-6">
        <MultiPhotoWidget v-model="photos" :error="photosError">
        </MultiPhotoWidget>
      </div>

      <div class="col-sm-12 col-md-6">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <ModelSelect
              v-model="model"
              :options="Array.from(coreStore.models.values())"
            />
          </div>

          <div class="col-6">
            <q-input
              :error="!!server_errors.serial_number"
              :error-message="
                server_errors.serial_number && server_errors.serial_number[0]
              "
              name="serial_number"
              type="number"
              lazy-rules="ondemand"
              :disable="!family?.short_name"
              filled
              v-model="serial_number"
              label="Serial number"
              hint="If you have a serial # enter it here"
              :prefix="`${family?.short_name}.`"
            />
          </div>

          <div class="col-12">
            <q-input
              filled
              :error="!!server_errors.serial_request_link"
              :error-message="
                server_errors.serial_request_link &&
                server_errors.serial_request_link[0]
              "
              :disable="serial_number === null"
              type="url"
              v-model="serial_request_link"
              label="Serial Request URL"
              hint="Link to your serial request video if available"
            />
          </div>

          <div class="col-12">
            <q-input
              filled
              :error="!!server_errors.printer_name"
              :error-message="
                server_errors.printer_name && server_errors.printer_name[0]
              "
              v-model="printer_name"
              label="Printer Name"
              hint="If your printer has a nickname, enter it here"
            />
          </div>

          <div class="col-12" v-if="printer?.id">
            <q-input
              filled
              :placeholder="printer?.id"
              v-model="vanity_url"
              label="Vanity URL"
              prefix="/printer/"
              :error="!!server_errors.vanity_url"
              :error-message="
                server_errors.vanity_url && server_errors.vanity_url[0]
              "
              :rules="[validateVanityURL]"
            >
              <template v-slot:hint>
                <div>
                  <span>Choose a custom url.</span>&nbsp;
                  <span>
                    <strong>Suggestions: </strong>
                    <q-chip
                      v-for="sugg in vanityURLSuggestions"
                      clickable
                      @click="vanity_url = sugg.generate()"
                      :key="sugg.id"
                      dense
                      class="q-ma-none"
                      >{{ sugg.generate() }}
                    </q-chip>
                  </span>
                </div>
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <FrameColorSelect
              v-model="frame_color"
              :rules="[(val) => val != undefined || 'This field is required']"
            />
          </div>

          <div class="col-12">
            <FilamentPicker
              :allow-add="true"
              label="Primary Filament"
              v-model="primary_filament"
              hint="If your filament is not listed, use basic mode and choose the closest color."
              :rules="[(val) => val != undefined || 'This field is required']"
              :error="!!server_errors.primary_filament"
              :error-message="
                server_errors.primary_filament &&
                server_errors.primary_filament[0]
              "
            />
          </div>
          <div class="col-12">
            <FilamentPicker
              :allow-add="true"
              label="Accent Filament"
              v-model="accent_filament"
              hint="If your filament is not listed, use basic mode and choose the closest color."
              :rules="[(val) => val != undefined || 'This field is required']"
              :error="!!server_errors.accent_filament"
              :error-message="
                server_errors.accent_filament &&
                server_errors.accent_filament[0]
              "
            />
          </div>
          <div class="col-12">
            <ModSelect v-model="mods" />
          </div>
          <div class="col-12">
            <q-input
              :error="!!server_errors.notes"
              :error-message="server_errors.notes && server_errors.notes[0]"
              lazy-rules="ondemand"
              label="Notes"
              filled
              autogrow
              v-model="notes"
              bottom-slots
              hint="Markdown formatting is supported."
            />
          </div>
          <div class="col-12">
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox v-model="anonymous" color="dark"></q-checkbox>
              </q-item-section>
              <q-item-section>
                <q-item-label>Submit Anonymously</q-item-label>
                <q-item-label caption
                  >Your username will not be displayed in search
                  results</q-item-label
                >
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12">
            <q-btn
              :disable="submitting"
              :label="`${this.printer ? 'Save Changes' : 'Submit'}`"
              icon="upload"
              type="submit"
              color="dark"
            />
            <q-btn
              label="Cancel"
              icon="close"
              @click.stop="$router.back()"
              color="dark"
              class="q-ml-md"
            />
          </div>
        </div>
      </div>
    </div>
  </q-form>
</template>
<style lang="scss">
div.q-field__prefix {
  padding-right: 0px;
}
</style>
<script>
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";
import FilamentPicker from "components/FilamentPicker.vue";
import MultiPhotoWidget from "components/MultiPhotoWidget.vue";

import ModelSelect from "components/ModelSelect.vue";
import FrameColorSelect from "./FrameColorSelect.vue";
import ModSelect from "./ModSelect.vue";
export default {
  name: "PrinterForm",
  props: {
    printer: {
      required: false,
      type: Object,
    },
  },
  components: {
    FilamentPicker,
    ModelSelect,
    FrameColorSelect,
    ModSelect,
    MultiPhotoWidget,
  },
  computed: {
    ...mapStores(useCoreStore),
    vanityURLSuggestions() {
      return [
        {
          id: 1,
          generate: () => this.printer_name,
          check: () => this.printer_name,
        },
        {
          id: 2,
          generate: () => `${this.family.short_name}-${this.serial_number}`,
          check: () => this.serial_number,
        },
        {
          id: 3,
          generate: () =>
            this.slugify(
              `${this.coreStore.userData.username}-${this.model.model_name}`
            ),
          check: () => !this.anonymous && this.model,
        },
      ].filter((s) => s.check());
    },
    filteredModels() {
      if (this.family === null) {
        return [];
      }
      const models = Array.from(this.coreStore.models.values()).filter(
        (m) => m.family_id === this.family.id
      );
      return models;
    },
  },
  watch: {
    photo: function (newVal, oldVal) {
      if (this.thumbnail) {
        URL.revokeObjectURL(this.thumbnail);
      }
      if (newVal !== this.photoPlaceholder) {
        this.thumbnail = URL.createObjectURL(newVal);
      }
    },
    model: function (newVal, oldVal) {
      if (newVal) {
        this.family = this.coreStore.families.get(this.model.family_id);
      } else {
        this.family = null;
      }
    },
  },
  methods: {
    validateVanityURL(val) {
      if (val === "" || val === null) {
        return true;
      }
      if (val.match(/^\d+$/)) {
        return "Vanity URLs cannot be all all numbers.";
      }
      if (val.length < 3) {
        return "Vanity URLs must be at least 3 characters long.";
      } else if (val.length > 50) {
        return "Vanity URLs must be 50 characters or less.";
      }
      const badCharMatch = val.match(/[^-\p{L}\d]+/u);
      if (badCharMatch) {
        return `Invalid character: '${badCharMatch}'`;
      }
      return true;
    },
    slugify(val) {
      return val.replace(/[^-\p{L}]+/u, "-");
    },
    setFilamentValue(formData, key, fId) {
      if (typeof fId === "number") {
        formData.append(key, fId);
      } else {
        const f = { ...this.coreStore.filaments.get(fId) };
        formData.append(`${key}__color`, f.color);
        formData.append(`${key}__color_category`, f.color_category_id);
        formData.append(`${key}__color_name`, f.color_name);

        if (typeof f.manufacturer_id === "string") {
          const mfg = this.coreStore.manufacturers.get(f.manufacturer_id);
          formData.append(`${key}__manufacturer__name`, mfg.name);
        } else {
          formData.append(`${key}__manufacturer`, f.manufacturer_id);
        }

        if (typeof f.type_id === "string") {
          const type_ = this.coreStore.types.get(f.type_id);
          formData.append(`${key}__type__name`, type_.name);
        } else {
          formData.append(`${key}__type`, f.type_id);
        }

        formData.append(`${key}__source`, f.source);
      }
    },
    async handleSubmit(event) {
      this.submitting = true;
      // validate files here because it's not a real field
      if (this.photos.length == 0) {
        this.photosError = "At least one photo is required.";
      }
      const fd = new FormData();
      fd.append("csrfmiddlewaretoken", this.$q.cookies.get("csrftoken"));
      fd.append("printer_model", this.model.id);
      fd.append("printer_name", this.printer_name || "");
      fd.append("serial_request_link", this.serial_request_link || "");
      fd.append("frame_color", this.frame_color.id);
      fd.append("serial_number", this.serial_number || "");
      fd.append("vanity_url", this.vanity_url || "");
      fd.append("anonymous", this.anonymous);
      this.setFilamentValue(fd, "primary_filament", this.primary_filament.id);
      this.setFilamentValue(fd, "accent_filament", this.accent_filament.id);

      if (this.mods) {
        for (let mId of this.mods) {
          fd.append("mods", mId);
        }
      }
      fd.append("notes", this.notes || "");
      if (this.photo !== this.photoPlaceholder) {
        fd.append("photo", this.photo);
      }
      for (let i = 0; i < this.photos.length; i++) {
        const p = this.photos[i];
        const prefix = `photos-${i}-`;
        if (p.id) {
          fd.append(`${prefix}id`, p.id);
        } else {
          fd.append(`${prefix}photo`, p._file);
        }
        fd.append(`${prefix}sort_order`, i);
        fd.append(`${prefix}caption`, p.caption || "");
      }
      let url = "/api/printer/";
      let method = "POST";
      if (this.printer) {
        method = "PUT";
        url = `${url}${this.printer.id}/`;
      }

      try {
        const response = await this.$api.request({
          headers: {
            "X-CSRFToken": this.$q.cookies.get("csrftoken"),
            "Content-Type": "multipart/form-data",
          },
          method: method,
          url: url,
          data: fd,
        });
        if (response.status === 201 || response.status === 200) {
          this.$emit("saved", response.data);
          this.$q.notify({
            type: "positive",
            message:
              response.status === 201
                ? "Thanks for your submission!"
                : "Your changes have been saved",
          });
          // reload the filament data in case some was added, this could be avoided, but it's hard.
          this.coreStore.loaded = false;
          this.coreStore.fetchData();
        } else {
          this.$q.notify({
            type: "negative",
            message: response.data,
          });
        }
      } catch (err) {
        if (typeof err.response.data === "object") {
          this.server_errors = err.response.data;
        }
        this.$q.notify({
          type: "negative",
          message:
            "There was a problem with your submission, please review the errors above and try again.",
        });
      } finally {
        this.submitting = false;
      }
    },
    handleReset(event) {
      this.$emit("reset", event);
    },
  },
  mounted() {
    const cs = this.coreStore;
    this.model = cs.models.get(this.printer?.printer_model) || null;
    this.thumbnail = this.printer?.photo || null;
    this.serial_number = this.printer?.serial_number || null;
    this.serial_request_link = this.printer?.serial_request_link || null;
    this.printer_name = this.printer?.printer_name || null;
    this.frame_color = cs.frameColors.get(this.printer?.frame_color) || null;
    this.primary_filament =
      cs.filaments.get(this.printer?.primary_filament) || null;
    this.accent_filament =
      cs.filaments.get(this.printer?.accent_filament) || null;
    this.photos = this.printer?.photos || [];
    this.mods = this.printer?.mods || [];
    this.vanity_url = this.printer?.vanity_url || null;
    this.notes = this.printer?.notes || null;

    this.anonymous =
      (this.printer && this.printer.submitted_by == null) || false;

    if (this.thumbnail) {
      this.photoPlaceholder = new File([], this.thumbnail);
      this.photo = this.photoPlaceholder;
    }
  },
  data() {
    return {
      photoPlaceholder: null,
      model: null,
      photo: null,
      serial_number: null,
      printer_name: null,
      frame_color: null,
      primary_filament: null,
      accent_filament: null,
      mods: [],
      photos: [],
      photosError: null,
      notes: null,
      anonymous: false,
      family: null,
      thumbnail: null,
      vanity_url: null,
      serial_request_link: null,
      server_errors: {},
      submitting: false,
    };
  },
};
</script>
