#!/bin/bash
# Setup environment and start ttn-fan control loop

Params=""

if [ -n "${GW_TARGET_TEMP}" ]
then
  Params="${Params} --target-temp ${GW_TARGET_TEMP}"
fi

if [ -n "${GW_INFLUXDB_HOST}" ]
then
  sed -i "s/^    influxdb_host = .*/    influxdb_host = '${GW_INFLUXDB_HOST}'/" ./ttn-fan/ttn-fan.py
  Params="${Params} --influxdb"
fi

if [ -n "${GW_INFLUXDB_DBNAME}" ]
then
  sed -i "s/^    influxdb_dbname = .*/    influxdb_dbname = '${GW_INFLUXDB_DBNAME}'/" ./ttn-fan/ttn-fan.py
fi

echo "*** Starting TTN Fan control"
echo "*** InfluxDB host     : ${GW_INFLUXDB_HOST:-Default}"
echo "*** InfluxDB DB name  : ${GW_INFLUXDB_DBNAME:-Default}"
echo "*** Target temperature: ${GW_TARGET_TEMP:-Default}"
exec python -u ./ttn-fan/ttn-fan.py \
        --user-mode \
        --lock-file /var/ttn/sht21.lock \
        --status-file /var/ttn/fan-stat.json \
        ${Params}
