<template>
  <q-page padding>
    <PageHeader icon="voron" title="About vorondb" />
    <q-separator />
    <div class="q-pa-lg relative-position">
      <blockquote class="q-pa-md text-h3 text-center">
        &ldquo;You do not build <em>a</em> Voron, you build
        <em>your </em> Voron&rdquo;
      </blockquote>
    </div>
    <div class="row justify-center">
      <div class="col-xs-12 col-md-6 text-body1">
        <p class="q-mx-xl">
          It is quite the achievement to successfully build a Voron. Each one is
          a unique creation, and deserves to be celebrated!
        </p>

        <p class="q-mx-xl">
          Did you finally get that serial number, and want to be recognized for
          your hard work? Have you put together a sweet build that you want to
          share with others? Please consider spending a few moments adding your
          printer to the database today.
        </p>

        <p class="q-mx-xl">Not interested in showing off?</p>

        <p class="q-mx-xl">
          We all know the feeling of <em>analysis paralysis</em> when it comes
          to choosing your printer's color scheme. By creating a profile for
          your printer, you're contributing to an ever-growing database that
          will help future voron builders to make those critical decisions, like
          "What would look good with a hot pink frame?"
        </p>

        <p class="q-mx-xl">
          It's not all about colors, either. Printers can be searched by model,
          serial number, installed mods, and more.
        </p>

        <div v-if="!coreStore.userData?.id" class="q-mx-xl">
          <div>
            All you need to do is sign in with your discord account using the
            button below to get started.
          </div>
          <div class="text-center q-mt-xl">
            <form action="/accounts/discord/login/?process=login" method="POST">
              <input
                type="hidden"
                name="csrfmiddlewaretoken"
                :value="$q.cookies.get('csrftoken')"
              />
              <q-btn
                size="xl"
                style="background-color: #7289da"
                icon="discord"
                label="Sign-in with Discord"
                type="submit"
              />
            </form>
          </div>
        </div>

        <div v-else class="q-mx-xl q-mt-xl text-center">
          <q-btn
            to="/new"
            size="xl"
            icon="upload"
            label="Add your printer now"
            color="positive"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>
<style scoped lang="scss"></style>
<script>
import { useCoreStore } from "stores/core";
import { mapStores } from "pinia";
import PageHeader from "components/PageHeader.vue";
export default {
  name: "AboutPage",
  components: { PageHeader },
  computed: {
    ...mapStores(useCoreStore),
  },
};
</script>
