/* global $, Vue, axios */
/* eslint-disable no-new */

new Vue({
  el: '#leaderboard-wrap',

  data() {
    return {
      topUsers: [],
      topServers: [],
    };
  },

  mounted() {
    axios
      .get('https://rabitrup.com/leaderboard')
      .then(response => {
        this.topUsers = response.data.topUsers;
        this.topServers = response.data.topServers;

        this.$el.querySelector('#leaderboard').classList = '';
      })
      .catch(() => {});
  },
});

new Vue({
  el: '#status-wrap',

  data() {
    return {
      isOnline: false,
    };
  },

  mounted() {
    axios
      .get('https://rabitrup.com/ping')
      .then(() => {
        this.isOnline = true;
      })
      .catch(() => {}).finally(() => {
        $('[data-toggle="tooltip"]').tooltip();
      });
  },
});
