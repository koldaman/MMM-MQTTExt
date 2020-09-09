Module.register("MMM-MQTT", {
  log: function (...args) {
    if (this.config.logging) {
      args.forEach((arg) => console.log(arg));
    }
  },

  getScripts: function () {
    return [
      this.file("node_modules/jsonpointer/jsonpointer.js"),
      "topics_match.js",
    ];
  },

  // Default module config
  defaults: {
    mqttServers: [],
    logging: false,
    useWildcards: false,
  },

  makeServerKey: function (server) {
    return "" + server.address + ":" + (server.port | ("1883" + server.user));
  },

  start: function () {
    console.log(this.name + " started.");
    this.subscriptions = [];

    console.log(
      this.name +
        ": Setting up connection to " +
        this.config.mqttServers.length +
        " servers"
    );

    for (i = 0; i < this.config.mqttServers.length; i++) {
      var s = this.config.mqttServers[i];
      var serverKey = this.makeServerKey(s);
      console.log(
        this.name +
          ": Adding config for " +
          s.address +
          " port " +
          s.port +
          " user " +
          s.user
      );
      for (j = 0; j < s.subscriptions.length; j++) {
        var sub = s.subscriptions[j];
        this.subscriptions.push({
          serverKey: serverKey,
          label: sub.label,
          topic: sub.topic,
          decimals: sub.decimals,
          decimalSignInMessage: sub.decimalSignInMessage,
          jsonpointer: sub.jsonpointer,
          jsonkey1: sub.jsonkey1,
          jsonvalue1: sub.jsonvalue1,
          jsonkey2: sub.jsonkey2,
          jsonvalue2: sub.jsonvalue2,
          suffix: typeof sub.suffix == "undefined" ? "" : sub.suffix,
          value: "",
          lastupdate: typeof sub.lastupdate == "undefined" ? false : sub.lastupdate,
          time: Date.now(),
          maxAgeSeconds: sub.maxAgeSeconds,
          sortOrder: sub.sortOrder || i * 100 + j,
          colors: sub.colors,
          conversions: sub.conversions,
          multiply: sub.multiply,
          divide: sub.divide,
        });
      }
    }

    this.openMqttConnection();
    var self = this;
    setInterval(function () {
      self.updateDom(100);
    }, 5000);
  },

  openMqttConnection: function () {
    this.sendSocketNotification("MQTT_CONFIG", this.config);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MQTT_PAYLOAD") {
      if (payload != null) {
        for (i = 0; i < this.subscriptions.length; i++) {
          sub = this.subscriptions[i];
          
          if (sub.lastupdate) {
                    var df = this.timeDifference(payload.time, sub.time);
                    if (df !== '-') {
                        var li = sub.suffix.lastIndexOf('(');
                        if (li > 0) {
                            sub.suffix = sub.suffix.substr(0, li);
                        }
                        sub.suffix += '(' + df + ')';
                    }
                }
                
          if (
            sub.serverKey == payload.serverKey && this.config.useWildcards
              ? topicsMatch(sub.topic, payload.topic)
              : sub.topic == payload.topic
          ) {
            let if1 = true;
            let if2 = true;
            if (sub.jsonkey1 && sub.jsonvalue1) {
                let value1 = get(JSON.parse(payload.value), sub.jsonkey1);
                if1 = value1 === sub.jsonvalue1;
            }
            if (sub.jsonkey2 && sub.jsonvalue2) {
                let value2 = get(JSON.parse(payload.value), sub.jsonkey2);
                if2 = value2 === sub.jsonvalue2;
            }
            if (!if1 || !if2) continue;
                
            var value = payload.value;

            // Extract value if JSON Pointer is configured
            if (sub.jsonpointer) {
              value = get(JSON.parse(value), sub.jsonpointer);
            }

            // Convert decimal point
            if (sub.decimalSignInMessage) {
              value = value.replace(sub.decimalSignInMessage, ".");
            }

            // Multiply or divide
            value = this.multiply(sub, value);

            // Round if decimals is configured
            if (isNaN(sub.decimals) == false) {
              if (isNaN(value) == false) {
                value = Number(value).toFixed(sub.decimals);
              }
            }

            sub.value = value;
            sub.time = payload.time;
          }
        }
        this.updateDom();
      } else {
        console.log(this.name + ": MQTT_PAYLOAD - No payload");
      }
    }
  },

  timeDifference: function (current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        var secs = Math.round(elapsed/1000);
        if (secs <= 0) return "-";
         return secs + 's';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + 'm';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + 'h';   
    }

    else if (elapsed < msPerMonth) {
        return 'app. ' + Math.round(elapsed/msPerDay) + 'd';   
    }

    else if (elapsed < msPerYear) {
        return 'app. ' + Math.round(elapsed/msPerMonth) + 'm';   
    }

    else {
        return 'app. ' + Math.round(elapsed/msPerYear ) + 'y';   
    }
  },
  
  getStyles: function () {
    return ["MQTT.css"];
  },

  isValueTooOld: function (maxAgeSeconds, updatedTime) {
    if (maxAgeSeconds) {
      if (updatedTime + maxAgeSeconds * 1000 < Date.now()) {
        return true;
      }
    }
    return false;
  },

  getColors: function (sub) {
    this.log(sub.topic);
    this.log("Colors:", sub.colors);
    this.log("Value: ", sub.value);
    if (!sub.colors || sub.colors.length == 0) {
      return {};
    }

    let colors;
    for (i = 0; i < sub.colors.length; i++) {
      colors = sub.colors[i];
      if (sub.value < sub.colors[i].upTo) {
        break;
      }
    }

    return colors;
  },

  multiply: function (sub, value) {
    if (!sub.multiply && !sub.divide) {
      return value;
    }
    if (!value) {
      return value;
    }
    if (isNaN(value)) {
      return value;
    }
    let res = (+value * (sub.multiply || 1)) / (sub.divide || 1);
    return isNaN(res) ? value : "" + res;
  },

  convertValue: function (sub) {
    if (!sub.conversions || sub.conversions.length == 0) {
      return sub.value;
    }
    for (i = 0; i < sub.conversions.length; i++) {
      if (("" + sub.value).trim() == ("" + sub.conversions[i].from).trim()) {
        return sub.conversions[i].to;
      }
    }
    return sub.value;
  },

  getDom: function () {
    self = this;
    var wrapper = document.createElement("table");
    wrapper.className = "small";

    if (self.subscriptions.length === 0) {
      wrapper.innerHTML = self.loaded
        ? self.translate("EMPTY")
        : self.translate("LOADING");
      wrapper.className = "small dimmed";
      console.log(self.name + ": No values");
      return wrapper;
    }

    self.subscriptions
      .sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      })
      .forEach(function (sub) {
        var subWrapper = document.createElement("tr");
        let colors = self.getColors(sub);

        // Label
        var labelWrapper = document.createElement("td");
        labelWrapper.innerHTML = sub.label;
        labelWrapper.className = "align-left mqtt-label";
        labelWrapper.style.color = colors.label;
        subWrapper.appendChild(labelWrapper);

        // Value
        tooOld = self.isValueTooOld(sub.maxAgeSeconds, sub.time);
        var valueWrapper = document.createElement("td");
        valueWrapper.innerHTML = self.convertValue(sub);
        valueWrapper.className =
          "align-right medium mqtt-value " + (tooOld ? "dimmed" : "bright");
        valueWrapper.style.color = tooOld
          ? valueWrapper.style.color
          : colors.value;
        subWrapper.appendChild(valueWrapper);

        // Suffix
        var suffixWrapper = document.createElement("td");
        suffixWrapper.innerHTML = sub.suffix;
        suffixWrapper.className = "align-left mqtt-suffix";
        subWrapper.appendChild(suffixWrapper);
        subWrapper.style.color = colors.suffix;

        wrapper.appendChild(subWrapper);
      });

    return wrapper; // moje
  },
});
