# MMM-MQTTExt

Extension of [MMM-MQTT](https://github.com/ottopaulsen/MMM-MQTT) with some enhancements. Used for [MagicMirror](https://github.com/MichMich/MagicMirror/).

New attributes introduced:
- jsonkey1
- jsonvalue1
- jsonkey2
- jsonvalue2
- lastupdate

```
{
            module: 'MMM-MQTT',
            position: 'top_right',
            header: 'Počasí',
            config: {
                logging: false,
                useWildcards: true,
                mqttServers: [
                    {
                        address: '10.10.10.20',  // Server address or IP address
                        port: '1883',          // Port number if other than default
                        user: '',          // Leave out for no user
                        password: '',  // Leave out for no password
                        subscriptions: [
                            {
                                topic: 'influx/weather/temp', // Topic to look for
                                label: 'Venku', // Displayed in front of value
                                suffix: '°C',         // Displayed after the value
                                lastupdate: true,
                                jsonkey1: '/meter',
                                jsonvalue1: 'temp',
                                jsonkey2: '/dev',
                                jsonvalue2: 'wemos-weather',
                                jsonpointer: '/value',
                                maxAgeSeconds: 900,
                            },
                            {
                                topic: 'influx/weather/temp', // Topic to look for
                                label: 'Uvnitř', // Displayed in front of value
                                suffix: '°C',         // Displayed after the value
                                lastupdate: true,
                                jsonkey1: '/meter',
                                jsonvalue1: 'temp',
                                jsonkey2: '/dev',
                                jsonvalue2: 'nodemcu-weather-station',
                                jsonpointer: '/value',
                                maxAgeSeconds: 900,
                            },
                            {
                                topic: 'influx/weather/temp', // Topic to look for
                                label: 'Vlhkost', // Displayed in front of value
                                suffix: '%',         // Displayed after the value
                                jsonkey1: '/meter',
                                jsonvalue1: 'hum',
                                jsonkey2: '/dev',
                                jsonvalue2: 'wemos-weather',
                                jsonpointer: '/value',
                                maxAgeSeconds: 900,
                            },
                            {
                                topic: 'influx/weather/temp', // Topic to look for
                                label: 'Tlak', // Displayed in front of value
                                suffix: 'Hpa',         // Displayed after the value
                                jsonkey1: '/meter',
                                jsonvalue1: 'press',
                                jsonkey2: '/dev',
                                jsonvalue2: 'wemos-weather',
                                decimals: 1,
                                divide: 100,
                                jsonpointer: '/value',
                                maxAgeSeconds: 900,
                            },
                            {
                                topic: 'influx/weather/temp', // Topic to look for
                                label: 'Vcc', // Displayed in front of value
                                suffix: 'V',         // Displayed after the value
                                jsonkey1: '/meter',
                                jsonvalue1: 'vcc',
                                jsonkey2: '/dev',
                                jsonvalue2: 'wemos-weather',
                                jsonpointer: '/value',
                                maxAgeSeconds: 900,
                            },
                            {
                                topic: 'influx/home/energy', // Topic to look for
                                label: 'Energy1', // Displayed in front of value
                                suffix: 'W ',
                                lastupdate: true,
                                jsonkey1: '/topic',
                                jsonvalue1: 'energy',
                                jsonkey2: '/meter',
                                jsonvalue2: 'electricity1-realtime',
                                jsonpointer: '/value',
                                maxAgeSeconds: 10,
                            },
                            {
                                topic: 'influx/home/energy', // Topic to look for
                                label: 'Energy2', // Displayed in front of value
                                suffix: 'W ',
                                lastupdate: true,
                                jsonkey1: '/topic',
                                jsonvalue1: 'energy',
                                jsonkey2: '/meter',
                                jsonvalue2: 'electricity2-realtime',
                                jsonpointer: '/value',
                                maxAgeSeconds: 10,
                            },
                            {
                                topic: 'influx/home/energy', // Topic to look for
                                label: 'Energy3', // Displayed in front of value
                                suffix: 'W ',
                                lastupdate: true,
                                jsonkey1: '/topic',
                                jsonvalue1: 'energy',
                                jsonkey2: '/meter',
                                jsonvalue2: 'electricity3-realtime',
                                jsonpointer: '/value',
                                maxAgeSeconds: 10,
                            },
                        ]
                    }
                ],
            }
        }
```