<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-dark">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <router-link to="/">
          <q-avatar style="margin-left: 12px" square>
            <svg
              viewBox="0 0 452.89992 381.40001"
              width="32px"
              height="32px"
              version="1.1"
              id="VoronLogo"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:svg="http://www.w3.org/2000/svg"
            >
              <g transform="translate(-51.938398,-38.504699)">
                <path
                  id="logo1"
                  :style="`fill: ${
                    coreStore.logoOverride ? coreStore.logo1 : undefined
                  }`"
                  d="M 281.73838,38.5047 150.33842,229.00473 H 51.938395 L 183.93839,38.704743 Z"
                  :class="
                    coreStore.logoOverride
                      ? 'logo-transition'
                      : 'logo-transition ani'
                  "
                />
                <path
                  id="logo2"
                  :style="`fill: ${
                    coreStore.logoOverride ? coreStore.logo2 : undefined
                  }`"
                  d="M 458.83836,38.5047 193.73838,419.90469 H 96.738383 L 360.73838,38.604706 Z"
                  :class="
                    coreStore.logoOverride
                      ? 'logo-transition'
                      : 'logo-transition ani'
                  "
                />
                <path
                  id="logo3"
                  :style="`fill: ${
                    coreStore.logoOverride ? coreStore.logo3 : undefined
                  }`"
                  d="m 405.83836,227.60471 h 99 L 370.93833,419.90469 h -98.09997 z"
                  :class="
                    coreStore.logoOverride
                      ? 'logo-transition'
                      : 'logo-transition ani'
                  "
                />
              </g>
            </svg>
            <q-menu touch-position context-menu v-if="coreStore.logoOverride">
              <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup @click="saveLogo">
                  <q-item-section>Save logo...</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="saveTheme">
                  <q-item-section>Download Mainsail Theme...</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-avatar>
        </router-link>
        <q-toolbar-title> Voron Printer Database </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-scroll-area
        style="height: calc(100% - 150px); margin-top: 150px"
        content-style="flex-direction: column; display: flex;"
      >
        <q-list>
          <q-item v-ripple clickable active-class="tab-active" to="/" exact>
            <q-item-section avatar>
              <q-icon name="voron" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Printer Database</q-item-label>
              <q-item-label caption
                >Browse the Voron Printer Database</q-item-label
              >
            </q-item-section>
          </q-item>

          <q-item
            v-ripple
            clickable
            active-class="tab-active"
            to="/filament"
            exact
          >
            <q-item-section avatar>
              <q-icon name="filament" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Filament Database</q-item-label>
              <q-item-label caption>Browse the Filament Database</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            active-class="tab-active"
            to="/my-printers"
            v-if="loggedIn"
          >
            <q-item-section avatar>
              <q-icon name="list" />
            </q-item-section>

            <q-item-section>
              <q-item-label>My Printers</q-item-label>
              <q-item-label caption>View all your submissions</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            active-class="tab-active"
            to="/new"
            v-if="loggedIn"
          >
            <q-item-section avatar>
              <q-icon name="upload" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Submit Your Printer</q-item-label>
              <q-item-label caption
                >Add your entry to the Printer Database</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            active-class="tab-active"
            href="/admin/"
            v-if="coreStore.userData?.is_staff"
          >
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Admin Panel</q-item-label>
              <q-item-label caption>Here be dragons</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple active-class="tab-active" href="/contact/">
            <q-item-section avatar>
              <q-icon name="mail" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Contact Us</q-item-label>
              <q-item-label caption>Send us your feedback!</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-space />
        <q-list>
          <q-item dense tag="label">
            <q-item-section side>
              <q-icon name="dark_mode" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dark Mode</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="darkMode" />
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section side>
              <q-icon name="copyright" />
            </q-item-section>
            <q-item-section>
              <q-item-label>2023 MapleLeafMakers</q-item-label>
              <q-item-label caption>All Rights Reserved</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-img
        class="absolute-top"
        src="~assets/drawer-header.png"
        style="height: 150px"
      >
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm" v-if="loggedIn">
            <img
              v-if="coreStore.userData?.avatar"
              :src="coreStore.userData.avatar"
            />
            <q-icon v-else name="person" size="56px" />
          </q-avatar>

          <div class="row flex">
            <div class="col-10">
              <div class="text-weight-bold" v-if="loggedIn">
                {{ coreStore.userData?.username }}#{{
                  coreStore.userData?.discriminator
                }}
              </div>
              <div v-else>You are not signed in</div>
              <div v-if="loggedIn">
                Joined
                {{
                  new Date(coreStore.userData?.date_joined).toLocaleDateString()
                }}
              </div>
              <div v-else>Sign in with your Discord account</div>
            </div>
            <div class="col-2">
              <form
                :action="
                  loggedIn
                    ? '/accounts/logout/'
                    : '/accounts/discord/login/?process=login'
                "
                method="POST"
              >
                <input
                  name="csrfmiddlewaretoken"
                  type="hidden"
                  :value="$q.cookies.get('csrftoken')"
                />
                <q-btn
                  flat
                  round
                  :icon="loggedIn ? 'logout' : 'login'"
                  type="submit"
                >
                  <q-tooltip v-if="loggedIn">Sign Out</q-tooltip>
                  <q-tooltip v-else>Sign In</q-tooltip>
                </q-btn>
              </form>
            </div>
          </div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <div
        class="bg-warning text-black q-pa-sm row flex no-wrap relative-position"
        v-if="!welcomeDismissed && !loggedIn"
      >
        <q-btn
          flat
          class="absolute-top-right"
          icon="close"
          @click="hideWelcome"
        />
        <q-icon class="q-mr-md" size="sm" name="voron_heart"></q-icon>
        <div>
          Got a Voron of your own? Want to show it off? Create your printer
          profile now!
          <router-link to="/about">Find out more</router-link>
        </div>
      </div>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<style scoped lang="scss">
div.bg-warning a {
  color: black;
  font-weight: bold;
}
.body--light .tab-active {
  background-color: $grey-3;
}
.body--dark .tab-active {
  background-color: $grey-9;
}
.body--dark .footer-link {
  color: $grey-5;
}
.body--light .footer-link {
  color: $grey-9;
}
.ani {
  animation: bgColor 120s infinite linear;
  fill-rule: evenodd;
  clip-rule: evenodd;
  fill: #ff0000;
}
@keyframes bgColor {
  12.5% {
    fill: #ff0000;
  }
  25% {
    fill: #ffa500;
  }
  37.5% {
    fill: #ffff00;
  }
  50% {
    fill: #7fff00;
  }
  62.5% {
    fill: #00ffff;
  }
  75% {
    fill: #0000ff;
  }
  87.5% {
    fill: #9932cc;
  }
  100% {
    fill: #ff0000;
  }
}
</style>
<script>
import { defineComponent, ref } from "vue";
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";
import { colors } from "quasar";
import JSZip from "jszip";

export default defineComponent({
  name: "MainLayout",
  computed: {
    ...mapStores(useCoreStore),
    darkMode: {
      get() {
        return this.$q.dark.isActive;
      },
      set(v) {
        this.$q.dark.set(v);
      },
    },
    loggedIn() {
      return this.coreStore.userData?.id !== undefined;
    },
  },
  data() {
    return {
      leftDrawerOpen: false,
      welcomeDismissed:
        this.$q.localStorage.getItem("welcomeDismissed") || false,
    };
  },
  methods: {
    drawInlineSVG(svgElement, ctx, callback, size) {
      if (size === undefined) {
        size = 128;
      }
      var svgURL = new XMLSerializer()
        .serializeToString(svgElement)
        .replace(
          'width="32px" height="32px"',
          `width="${size}px" height="${size}px"`
        );
      var img = new Image();
      img.onload = function () {
        ctx.drawImage(this, 0, 0);
        callback();
      };
      img.src =
        "data:image/svg+xml; charset=utf8, " + encodeURIComponent(svgURL);
    },
    getLogoBlob(size, callback) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      this.drawInlineSVG(
        document.getElementById("VoronLogo"),
        ctx,
        () => {
          var img = canvas.toBlob((blob) => {
            callback(blob);
          }, "image/png");
        },
        size
      );
    },
    saveLogo() {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      this.drawInlineSVG(document.getElementById("VoronLogo"), ctx, () => {
        var img = canvas.toDataURL("image/png");
        let a = document.createElement("a");
        a.href = img;
        a.download = "voron_logo.png";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    },
    async saveTheme() {
      const zip = new JSZip();
      const primary = colors.rgbToHex(
        colors.textToRgb(document.querySelector("#logo2").style.fill)
      );
      const accent = colors.rgbToHex(
        colors.textToRgb(document.querySelector("#logo3").style.fill)
      );
      zip.file(
        "custom.css",
        `:root {
	  --v-anchor-base: ${primary};
    --v-primary-base: ${primary};
    --v-primary-lighten5: ${colors.lighten(primary, 75)};
    --v-primary-lighten4: ${colors.lighten(primary, 60)};
    --v-primary-lighten3: ${colors.lighten(primary, 45)};
    --v-primary-lighten2: ${colors.lighten(primary, 30)};
    --v-primary-lighten1: ${colors.lighten(primary, 15)};
    --v-primary-darken1: ${colors.lighten(primary, -15)};
    --v-primary-darken2: ${colors.lighten(primary, -30)};
    --v-primary-darken3: ${colors.lighten(primary, -45)};
    --v-primary-darken4: ${colors.lighten(primary, -60)};
    --v-accent-base: ${accent};
    --v-accent-lighten5: ${colors.lighten(accent, 75)};
    --v-accent-lighten4: ${colors.lighten(accent, 60)};
    --v-accent-lighten3: ${colors.lighten(accent, 45)};
    --v-accent-lighten2: ${colors.lighten(accent, 30)};
    --v-accent-lighten1: ${colors.lighten(accent, 15)};
    --v-accent-darken1: ${colors.lighten(accent, -15)};
    --v-accent-darken2: ${colors.lighten(accent, -30)};
    --v-accent-darken3: ${colors.lighten(accent, -45)};
    --v-accent-darken4: ${colors.lighten(accent, -60)};
}`
      );
      this.getLogoBlob(128, (blob) => {
        zip.file("sidebar-logo.png", blob);
        this.getLogoBlob(32, (blob) => {
          zip.file("favicon-32x32.png", blob);
          this.getLogoBlob(16, (blob) => {
            zip.file("favicon-16x16.png", blob);
            zip.generateAsync({ type: "blob" }).then((blob) => {
              const el = document.createElement("a");
              el.href = URL.createObjectURL(blob);
              el.download = "theme.zip";
              el.click();
              setTimeout(() => {
                URL.revokeObjectURL(el.href);
                el.remove();
              }, 500);
            });
          });
        });
      });
    },
    hideWelcome() {
      this.$q.localStorage.set("welcomeDismissed", true);
      this.welcomeDismissed = true;
    },
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
  },
});
</script>
