#!/bin/bash
# Fix Collectd configuration file and start daemon

Config="/etc/collectd/collectd.conf"
ConfigNetwork="/etc/collectd/collectd.conf.d/network.conf"
ConfigPython="/etc/collectd/collectd.conf.d/python.conf"

echo "*** Starting TTN Collectd daemon"

if [ "${RESIN}" = "1" ]
then
  echo "*** Running in resin.io environment"

  # Expunge unexpanded variables from docker-compose
  GwVars=$(compgen -A variable GW_)
  for GwVar in ${GwVars}
  do
    [[ ${!GwVar} == \$\{* ]] && unset ${GwVar}
  done
  unset GwVars

  # Set hostname, we take GW_ID, or Resin device name
  HostName="${GW_ID:-$RESIN_DEVICE_NAME_AT_INIT}"
  echo "*** Setting hostname to ${HostName}"
  sed -i "s/^FQDNLookup .*/FQDNLookup false/" "${Config}"
  sed -i "s/^#Hostname .*/Hostname \"${HostName}\"/" "${Config}"
fi

if [ -n "${GW_COLLECTD_SERVER}" ]
then
  echo "*** Collectd server: ${GW_COLLECTD_SERVER}"
  sed -i "s/^\tServer .*/\tServer \"${GW_COLLECTD_SERVER}\"/" "${ConfigNetwork}"
else
  echo "*** No Collectd server specified"
  exec sleep 86400
fi

if [ "${GW_BACKPLANE}" = "DBRGN" ]
then
  echo "*** Support for Dbrgn's backplane enabled"
  # Enable voltage, temperature, humidity collection
  sed -i 's/##SHT21## //' "${ConfigPython}"
  sed -i 's/##MCP3425## //' "${ConfigPython}"
fi

if [ "${GW_TTN_FAN}" = "true" ]
then
  echo "*** Fan monitoring enabled"
  sed -i 's/##TTN_FAN## //' "${ConfigPython}"
fi

exec collectd -C "${Config}" -f
