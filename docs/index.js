/* global $, Vue, axios */
/* eslint-disable no-new */

new Vue({
  el: "#status-wrap",

  data() {
    return {
      isOnline: false
    };
  },

  mounted() {
    axios
      .get("https://fuckadomain.name/ping")
      .then(() => {
        this.isOnline = true;
      })
      .catch(() => {})
      .finally(() => {
        $('[data-toggle="tooltip"]').tooltip();
      });
  }
});
