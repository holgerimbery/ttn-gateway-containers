# -*- coding: utf-8 -*-
"""
TTN Fan Plugin.

Publishes fan data from the ttn-fan container
"""
from json import load
import collectd

fan_stat_file = '/var/ttn/fan-stat.json'


def config(config):
    global fan_stat_file

    for node in config.children:
        key = node.key.lower()
        val = node.values[0]

        if key == 'fanstatfile':
            fan_stat_file = val
            collectd.info('ttn_fan plugin: Using stat file %s' % fan_stat_file)


def read():
    global fan_stat_file

    # Read the stats file
    try:
        with open(fan_stat_file, 'r') as f:
            fan_stats = load(f)
    except IOError, e:
        collectd.error('ttn_fan plugin: Cannot read gateway stats file %s' % e)
        collectd.error('ttn_fan plugin: (gateway not runing?)')
        return
    except ValueError:
        collectd.error('ttn_fan plugin: Cannot parse gateway stats file')
        return

    # Dispatch fan percentage
    v_fan = collectd.Values(plugin='ttn_fan', type='percent',
                            type_instance='fan_percentage')
    v_fan.dispatch(values=[fan_stats['fan']])


collectd.register_config(config)
collectd.register_read(read)
