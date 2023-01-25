<template>
  <q-card>
    <q-item
      :class="{
        header: true,
        'text-negative': error != null,
        'upload-wrap': true,
      }"
      tag="label"
      @dragover="dragHandler"
      @drop="dropHandler"
      @dragleave="dragLeaveHandler"
    >
      <q-item-section avatar>
        <q-icon name="photo" size="xl" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Photos</q-item-label>
        <q-item-label caption
          >You can up add to {{ maxPhotos }} photos. The first one should
          clearly show the frame and filament colors.</q-item-label
        >
      </q-item-section>
      <q-item-section side>
        <q-icon name="attach_file" />
        <input type="file" multiple @change="handleFileInput" />
      </q-item-section>
    </q-item>
    <draggable
      handle=".handle"
      :list="photos"
      item-key="photo"
      :animation="150"
      ghost-class="moving"
      @change="onOrderChange"
    >
      <template #item="{ element }">
        <q-item class="photo-item">
          <q-item-section thumbnail top>
            <div class="handle"></div>
            <img :src="element.photo" />
          </q-item-section>
          <q-item-section style="margin-left: 24px">
            <q-input
              v-model="element.caption"
              outlined
              autogrow
              dense
              placeholder="No caption"
            />
          </q-item-section>
          <q-item-section side v-if="photos.length > 1">
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="deletePhoto(element)"
            ></q-btn>
          </q-item-section>
        </q-item>
      </template>
    </draggable>
    <q-item dense v-if="error">
      <q-item-section>
        <q-item-label caption class="text-negative">{{ error }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-card>
</template>
<style scoped lang="scss">
div.handle {
  width: 24px;
  height: 100%;
  cursor: move;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSoVETOIOGSoThZERTpKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/q8ptIjx4Lgf7+497t4BQr3MNKtrEtB020zGolImuyoFXhFEL0QMIiIzy4inFtPwHF/38PH1LsyzvM/9OfrVnMUAn0Q8xwzTJt4gnt20Dc77xCIryirxOfGESRckfuS64vIb50KTBZ4pmunkPLFILBU6WOlgVjQ14hnikKrplC9kXFY5b3HWylXWuid/YTCnr6S4TnMUMSwhjgQkKKiihDJshGnVSbGQpP2oh3+k6U+QSyFXCYwcC6hAg9z0g//B726t/PSUmxSMAt0vjvMxBgR2gUbNcb6PHadxAvifgSu97a/Ugcgn6bW2FjoCBraBi+u2puwBlzvA8JMhm3JT8tMU8nng/Yy+KQsM3QJ9a25vrX2cPgBp6mr5Bjg4BMYLlL3u8e6ezt7+PdPq7wer8HK+JOxT+gAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+YMCRQvKma5CqMAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAARElEQVQI133KsQ2AMBAEwQFRABEkrvOLcIsUgBMqQLJJnhBW2uT2+GCCWmvBjo4WEeechw1HusIbejpww5KhoeR4+eMBiMcOyNfVD/oAAAAASUVORK5CYII=");
}
.upload-wrap.dragover {
  border: 2px dashed $info;
}
.q-item.moving .focus-helper {
  background-color: $info;
}
.body--dark .q-item.header {
  background-color: rgba(255, 255, 255, 0.1);
}
.body--light .q-item.header {
  background-color: rgba(0, 0, 0, 0.1);
}
input[type="file"] {
  opacity: 0;
  width: 0.1px;
  height: 0.1px;
  position: absolute;
}
.photo-item {
  border-bottom: 1px solid $grey-7;
}
.photo-item:first-child {
  border-top: 1px solid $grey-7;
}

.q-item__section--thumbnail img {
  width: 140px;
  height: 100px;
  object-fit: contain;
}
</style>
<script>
import draggable from "vuedraggable";
import { mapStores } from "pinia";
import { useCoreStore } from "stores/core";
import heic2any from "heic2any";

export default {
  name: "MultiPhotoWidget",
  props: ["model-value", "error"],
  components: { draggable },
  data() {
    return {
      photos: this.modelValue,
    };
  },
  watch: {
    modelValue(newVal, oldVal) {
      this.photos = newVal;
      this.deleted = [];
    },
  },
  computed: {
    ...mapStores(useCoreStore),
    maxPhotos() {
      return this.coreStore.userData.photo_limit;
    },
  },
  methods: {
    deletePhoto(p) {
      this.photos.splice(this.photos.indexOf(p), 1);
      if (p.id === null) {
        URL.revokeObjectURL(p.photo);
      }
    },
    async handleFileInput(e) {
      for (let f of e.target.files) {
        if (f.name.match(/\.heic$/i)) {
          console.log(f);
          f = await this.convertHEIC(f);
        }
        this.photos.push({
          id: null,
          name: f.name,
          caption: "",
          photo: URL.createObjectURL(f),
          _file: f,
        });
      }
      e.target.value = [];
    },
    async convertHEIC(file) {
      const blob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.75,
      });
      return new File([blob], file.name.replace(/^(.*)\.heic$/i, "$1.jpg"));
    },
    onOrderChange(e) {
      this.photos.forEach((p, i) => {
        p.sort_order = i;
      });
      this.$emit("update:model-value", this.photos);
    },
    dragHandler(e) {
      e.preventDefault();
      const el = document.querySelector(".upload-wrap");
      el.classList.add("dragover");
    },
    dragLeaveHandler(e) {
      if (e.target.classList.contains("upload-wrap")) {
        const el = document.querySelector(".upload-wrap");
        el.classList.remove("dragover");
      }
    },
    async dropHandler(ev) {
      const el = document.querySelector(".upload-wrap");
      el.classList.remove("dragover");
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();

      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (const item of [...ev.dataTransfer.items]) {
          if (item.kind === "file") {
            let file = item.getAsFile();
            if (file.name.match(/\.heic$/i)) {
              file = await this.convertHEIC(file);
            }
            this.photos.push({
              id: null,
              name: file.name,
              caption: "",
              photo: URL.createObjectURL(file),
              _file: file,
            });
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (const file of [...ev.dataTransfer.files]) {
          if (file.name.match(/\.heic$/i)) {
            file = await this.convertHEIC(file);
          }
          this.photos.push({
            id: null,
            name: file.name,
            caption: "",
            photo: URL.createObjectURL(file),
            _file: file,
          });
        }
      }
    },
  },
};
</script>
