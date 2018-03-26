#!/bin/bash
# Fix Collectd configuration file and start daemon

Config="/etc/collectd/collectd.conf"
ConfigNetwork="/etc/collectd/collectd.conf.d/network.conf"
ConfigDbrgn="/etc/collectd/collectd.conf.d/dbrgn.conf"

if [ "${RESIN}" = "1" ]
then
 # Resin environement
 # Set hostname, we take GW_ID, or Resin device name
 HostName="${GW_ID:-$RESIN_DEVICE_NAME_AT_INIT}"
 echo "Setting hostname to ${HostName}"
 sed -i "s/^FQDNLookup .*/FQDNLookup false/" "${Config}"
 sed -i "s/^#Hostname .*/Hostname \"${HostName}\"/" "${Config}"
fi

if [ -n "${GW_COLLECTD_SERVER}" ]
then
  sed -i "s/^\tServer .*/\tServer \"${GW_COLLECTD_SERVER}\"/" "${ConfigNetwork}"
fi

if [ "${GW_BACKPLANE}" = "DBRGN" ]
then
  # Dbrgn's backplane: Enable voltage, temperature, humidity collection
  sed -i 's/.*"sht21-usermode".*/\tImport "sht21-usermode"/' "${ConfigDbrgn}"
  sed -i 's/.*"mcp3425".*/\tImport "mcp3425"/' "${ConfigDbrgn}"
fi

exec collectd -C "${Config}" -f
