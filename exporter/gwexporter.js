'use strict'

var fs = require("fs");
var http = require('http');

var promclient = require('prom-client');
var Gauge = promclient.Gauge;
var Histogram = promclient.Histogram;

var express = require('express');
var app = express();

var up_radio_packets_received = new Gauge({name: 'up_radio_packets_received', help: 'Radio packets received'});
var up_radio_packets_crc_good = new Gauge({name:'up_radio_packets_crc_good', help: 'Radio packets received with valid CRC'});
var up_radio_packets_crc_bad = new Gauge({name:'up_radio_packets_crc_bad', help: 'Radio packets received with invalid CRC'});
var up_radio_packets_crc_absent = new Gauge({name:'up_radio_packets_crc_absent', help: 'Radio packets received with no CRC'});
var up_radio_packets_dropped = new Gauge({name:'up_radio_packets_dropped', help: 'Radio packets dropped'});
var up_radio_packets_forwarded = new Gauge({name:'up_radio_packets_forwarded', help: 'Radio packets forwarded'});
var down_radio_packets_succes = new Gauge({name:'down_radio_packets_succes', help: 'Downlink packets sent successful'});
var down_radio_packets_failure = new Gauge({name:'down_radio_packets_failure', help: 'Downlink packets failed'});
var down_radio_packets_collision_packet = new Gauge({name:'down_radio_packets_collision_packet', help: 'Downlink packets collision with packet'});
var down_radio_packets_collision_beacon = new Gauge({name:'down_radio_packets_collision_beacon', help: 'Downlink packets collision with beacon'});
var down_radio_packets_too_early = new Gauge({name:'down_radio_packets_too_early', help: 'Downlink packets too early'});
var down_radio_packets_too_late = new Gauge({name:'down_radio_packets_too_late', help: 'Downlink packets too late'});
var down_beacon_packets_queued = new Gauge({name:'down_beacon_packets_queued', help: 'Beacon packets queued'});
var down_beacon_packets_send = new Gauge({name:'down_beacon_packets_send', help: 'Beacon packets send'});
var down_beacon_packets_rejected = new Gauge({name:'down_beacon_packets_rejected', help: 'Beacon packets rejected'});

var temperature_cpu = new Gauge({name:'temperature_cpu', help:'CPU temperature'});

app.get("/metrics", (req, res) => {
    var start = new Date().getTime();
    var contents = fs.readFileSync('loragwstat.json');
    var jsonContent = JSON.parse(contents);
    up_radio_packets_received.set(jsonContent.current.up_radio_packets_received);
    up_radio_packets_crc_good.set(jsonContent.current.up_radio_packets_crc_good);
    up_radio_packets_crc_bad.set(jsonContent.current.up_radio_packets_crc_bad);
    up_radio_packets_crc_absent.set(jsonContent.current.up_radio_packets_crc_absent);
    up_radio_packets_dropped.set(jsonContent.current.up_radio_packets_dropped);
    up_radio_packets_forwarded.set(jsonContent.current.up_radio_packets_forwarded);
    down_radio_packets_succes.set(jsonContent.current.down_radio_packets_succes);
    down_radio_packets_failure.set(jsonContent.current.down_radio_packets_failure);
    down_radio_packets_collision_packet.set(jsonContent.current.down_radio_packets_collision_packet);
    down_radio_packets_collision_beacon.set(jsonContent.current.down_radio_packets_collision_beacon);
    down_radio_packets_too_early.set(jsonContent.current.down_radio_packets_too_early);
    down_radio_packets_too_late.set(jsonContent.current.down_radio_packets_too_late);
    down_beacon_packets_queued.set(jsonContent.current.down_beacon_packets_queued);
    down_beacon_packets_send.set(jsonContent.current.down_beacon_packets_send);
    down_beacon_packets_rejected.set(jsonContent.current.down_beacon_packets_rejected);
    
    var temperature = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp');
    var tempInt = parseInt(temperature);
    tempInt = tempInt / 1000.0;
    temperature_cpu.set(tempInt);

    http.get('http://localhost:9100/metrics', (resp) => {
      var data = '';
      resp.on('data', (s) => {
	data += s;
      });
     
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        data += promclient.register.metrics()
	res.send(data)
      });
     
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
});

app.listen(process.env.port || 80, () => {
    console.log("Listening");
});
