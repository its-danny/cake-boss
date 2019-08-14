/* global Vue, axios */
/* eslint-disable no-new */

new Vue({
  el: '#leaderboard',

  data() {
    return {
      topUsers: [],
      topServers: [],
    };
  },

  mounted() {
    axios
      .get('http://159.65.181.207:3000/leaderboard')
      .then(response => {
        this.topUsers = response.data.topUsers;
        this.topServers = response.data.topServers;

        this.$el.querySelector('#leaderboard-content').classList = '';
      })
      .catch(() => {});
  },
});
