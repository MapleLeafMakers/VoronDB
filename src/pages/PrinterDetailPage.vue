<template>
  <NotFound v-if="notFound" />
  <q-page v-if="!notFound && printer && coreStore.loaded" padding>
    <div class="row flex items-center q-mb-sm">
      <q-btn
        icon="arrow_back"
        size="xl"
        class="q-mr-md"
        rounded
        flat
        @click="
          $router.options.history.state.back
            ? $router.back()
            : $router.push('/')
        "
      >
        <q-tooltip>Go Back</q-tooltip>
      </q-btn>
      <q-icon size="xl" class="q-mr-md" :name="printerModel?.icon" />
      <div>
        <span class="text-h4">{{ printerDisplayName }}</span>
        <p class="q-mb-none">
          <span v-if="printer.serial_number"
            >{{ printerFamily.short_name }}.{{ printer.serial_number }}</span
          >
        </p>
      </div>
    </div>
    <q-card>
      <q-list separator>
        <q-item>
          <q-item-section avatar>
            <q-avatar v-if="printer?.submitted_by?.avatar"
              ><img
                :src="printer.submitted_by.avatar"
                @error="printer.submitted_by.avatar = null"
              />
              /></q-avatar
            >
            <q-avatar v-else
              ><q-icon size="lg" class="q-ml-xs" name="person"></q-icon
            ></q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label
              >Submitted by
              <router-link
                v-if="printer?.submitted_by"
                :to="`/user/${printer?.submitted_by?.username}`"
                class="name-link"
              >
                {{ printer?.submitted_by?.username }}#{{
                  printer?.submitted_by?.discriminator
                }}
              </router-link>
              <span v-else>{{
                printer?.submitted_by?.username || "anonymous"
              }}</span></q-item-label
            >
            <q-item-label caption>{{
              new Date(printer.submitted_at).toLocaleString()
            }}</q-item-label>
          </q-item-section>
          <q-item-section
            side
            v-if="
              printer.submitted_by.id === coreStore.userData.id ||
              coreStore.userData.is_staff
            "
          >
            <div>
              <q-btn
                flat
                icon="edit"
                :to="{ name: 'printerUpdate', params: { id: printer.id } }"
              >
                <q-tooltip>Edit this printer</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
          <q-item-section side>
            <div>
              <q-btn
                :disable="!coreStore.userData?.id && likeButtonEnabled"
                flat
                icon="flag"
                @click="handleReportClick"
              >
                <q-tooltip>Report inappropriate content</q-tooltip>
              </q-btn>
              <q-tooltip v-if="printer.user_liked">Un-like</q-tooltip>
              <q-tooltip v-else-if="coreStore.userData?.id">Like</q-tooltip>
              <q-tooltip v-else>You are not signed in</q-tooltip>
            </div>
          </q-item-section>
          <q-item-section side>
            <div>
              <q-btn
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
            <q-item-label>{{ primaryFilament.color_name }}</q-item-label>
            <q-item-label
              v-if="primaryFilament && primaryFilament.manufacturer_id !== 1"
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
              :style="`background-color: ${this.accentFilament?.color}`"
            ></div>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ accentFilament.color_name }}</q-item-label>
            <q-item-label
              v-if="accentFilament && accentFilament.manufacturer_id !== 1"
              caption
              >{{ accentFilamentMfg.name }}
              {{ accentFilamentType.name }}</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-expansion-item v-if="youtubeID">
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon name="movie" size="lg" class="q-ml-xs" />
            </q-item-section>

            <q-item-section>
              <q-item-label>View Serial Request</q-item-label>
            </q-item-section>
          </template>
          <q-card>
            <q-card-section>
              <div
                style="max-width: 600px; margin-left: auto; margin-right: auto"
              >
                <q-video
                  loading="lazy"
                  :ratio="16 / 9"
                  :src="`https://youtube.com/embed/${youtubeID}`"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-item
          v-else-if="printer.serial_request_link"
          clickable
          target="_blank"
          :href="printer.serial_request_link"
        >
          <q-item-section avatar>
            <q-icon name="movie" size="lg" class="q-ml-xs" />
          </q-item-section>

          <q-item-section>
            <q-item-label>View Serial Request</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="printer.mods.length">
          <q-item-section avatar top>
            <q-icon name="handyman" size="lg" class="q-ml-xs" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Mods</q-item-label>
            <q-item-label caption>
              <template v-for="(mod, index) of modsList" :key="mod.id">
                <a :href="mod.url" class="external-link" target="_blank">{{
                  mod.name
                }}</a
                ><span v-if="index < printer.mods.length - 1">, </span>
              </template>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="printer.notes">
          <q-item-section avatar top>
            <q-icon name="feed" size="lg" class="q-ml-xs" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Notes</q-item-label>
            <q-item-label caption>
              <q-markdown no-html>{{ printer.notes }}</q-markdown>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator />
      <div class="row q-ma-sm" v-if="printer.photos.length > 1">
        <div
          :class="{ 'thumbnail-wrapper': true }"
          v-for="(photo, index) of printer.photos"
          :key="photo.id"
        >
          <img
            @click="slide = index"
            :class="{ active: index == slide }"
            :src="photo.photo_sm"
            style="height: 100px"
          />
        </div>
      </div>
      <div class="photo-viewer">
        <a
          :href="printer.photos[slide].photo"
          title="Click for full-sized image"
        >
          <img
            :src="printer.photos[slide].photo"
            alt="Click for full-sized image"
          />
        </a>
        <div
          class="absolute-top text-subtitle1 text-center text-white"
          v-if="printer.photos[slide].caption"
        >
          {{ printer.photos[slide].caption }}
        </div>
        <div class="slideArrow slideArrow-left" v-if="slide > 0">
          <div style="text-align: left">
            <q-btn
              flat
              round
              icon="chevron_left"
              size="xl"
              @click="slide = Math.max(slide - 1, 0)"
            />
          </div>
        </div>
        <div
          class="slideArrow slideArrow-right"
          v-if="slide < printer.photos.length - 1"
        >
          <div style="text-align: right">
            <q-btn
              flat
              round
              icon="chevron_right"
              size="xl"
              @click="slide = Math.min(slide + 1, printer.photos.length - 1)"
            />
          </div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>
<style lang="scss" scoped>
.photo-viewer .slideArrow {
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: stretch;
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 10em;
}
.photo-viewer .slideArrow > div {
  flex-grow: 100;
}
.photo-viewer .slideArrow .q-btn {
  text-shadow: black 0px 0px 8px;
}
.photo-viewer .slideArrow.slideArrow-left {
  left: 0px;
}
.photo-viewer .slideArrow.slideArrow-right {
  right: 0px;
}
.photo-viewer {
  text-align: center;
  position: relative;
}
.photo-viewer > div.absolute-top {
  background-color: rgba(0, 0, 0, 0.75);
  padding: 0.5em;
}
.photo-viewer img {
  max-width: 100%;
  max-height: 100vh;
}
.thumbnail-wrapper img {
  margin-left: 4px;
  box-sizing: border-box;
  cursor: pointer;
}
.thumbnail-wrapper .active {
  border: 3px solid $info;
}

.external-link:hover {
  text-decoration: underline;
}
.external-link:after {
  content: "\e895";
  font-family: Material Icons;
  font-weight: 400;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: "liga";
  margin: 0 0 0 3px;
  padding: 0;
}
.name-link {
  color: $primary;
}
.q-dark .name-link {
  color: $grey-3;
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
</style>
<script>
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";
import FilamentCard from "components/FilamentCard.vue";
import NotFound from "components/NotFound.vue";
export default {
  name: "PrinterDetailPage",
  props: ["printerId"],
  components: { NotFound },
  data() {
    return {
      printer: null,
      fullscreen: false,
      slide: 0,
      notFound: false,
    };
  },
  methods: {
    onKeyPress(ev) {
      if (ev.key === "ArrowLeft") {
        this.slide = Math.max(this.slide - 1, 0);
      } else if (ev.key === "ArrowRight") {
        this.slide = Math.min(this.slide + 1, this.printer.photos.length - 1);
      }
    },
    showFilamentCard(filament) {
      this.$q.dialog({
        component: FilamentCard,
        componentProps: { filament: filament },
      });
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
      this.printer.user_liked = resp.data.user_liked;
      this.printer.like_count = resp.data.like_count;
      this.likeButtonEnabled = true;
    },
    handleReportClick() {
      this.$q
        .dialog({
          title: "Report Inappropriate Content",
          message: "Enter a short message explaining the problem (optional)",
          prompt: {
            model: "",
            type: "text",
          },
          cancel: true,
        })
        .onOk((data) => {
          this.$api
            .post(
              `/api/printer/${this.printer.id}/report/`,
              { message: data },
              { headers: { "X-CSRFToken": this.$q.cookies.get("csrftoken") } }
            )
            .then(() => {
              this.$q.notify({
                type: "positive",
                message: "Your report has been submitted.",
              });
            });
        });
    },
  },
  mounted() {
    console.log("mounted");
    window.addEventListener("keydown", this.onKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeyPress);
    this.coreStore.logoOverride = false;
    this.coreStore.logo1 = this.coreStore.logo2 = this.coreStore.logo3 = null;
  },

  computed: {
    ...mapStores(useCoreStore),
    youtubeID() {
      if (this.printer.serial_request_link) {
        const url = new URL(this.printer.serial_request_link);
        let videoId = null;
        if (url.hostname === "youtu.be") {
          videoId = url.pathname.substring(1);
        } else if (url.hostname.endsWith("youtube.com")) {
          if (url.pathname === "/watch") {
            videoId = url.searchParams.get("v");
          } else if (url.pathname.startsWith("/embed/")) {
            videoId = url.pathname.substring(7, url.pathname.length);
          }
        }
        return videoId;
      }
      return null;
    },
    printerDisplayName() {
      if (this.printer.printer_name) {
        return `${this.printer.printer_name} (${this.printerModel.model_name})`;
      }
      return this.printerModel.model_name;
    },
    printerFamily() {
      return this.coreStore.families.get(this.printerModel.family_id);
    },
    printerModel() {
      return this.coreStore.models.get(this.printer.printer_model);
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
    modsList() {
      return Array.from(this.coreStore.mods.values()).filter(
        (m) => this.printer.mods.indexOf(m.id) !== -1
      );
    },
  },
  created() {
    this.coreStore
      .fetchPrinter(this.printerId)
      .then((p) => {
        this.printer = p;
        this.coreStore.logoOverride = true;
        this.coreStore.logo1 = this.frameColor.color;
        this.coreStore.logo2 = this.primaryFilament.color;
        this.coreStore.logo3 = this.accentFilament.color;
        if (this.printer.vanity_url) {
          this.$router.replace(`/printer/${this.printer.vanity_url}`);
        }
      })
      .catch((e) => {
        if (e.response && e.response.status == 404) {
          this.notFound = true;
        }
      });
  },
};
</script>
