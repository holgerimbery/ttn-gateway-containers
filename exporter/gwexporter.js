'use strict'

var fs = require("fs");
var http = require('http');

var promclient = require('prom-client');
var Gauge = promclient.Gauge;
var Histogram = promclient.Histogram;

var express = require('express');
var app = express();

var up_radio_packets_received = new Gauge('up_radio_packets_received', 'Radio packets received');
var up_radio_packets_crc_good = new Gauge('up_radio_packets_crc_good', 'Radio packets received with valid CRC');
var up_radio_packets_crc_bad = new Gauge('up_radio_packets_crc_bad', 'Radio packets received with invalid CRC');
var up_radio_packets_crc_absent = new Gauge('up_radio_packets_crc_absent', 'Radio packets received with no CRC');
var up_radio_packets_dropped = new Gauge('up_radio_packets_dropped', 'Radio packets dropped');
var up_radio_packets_forwarded = new Gauge('up_radio_packets_forwarded', 'Radio packets forwarded');
var down_radio_packets_succes = new Gauge('down_radio_packets_succes', 'Downlink packets sent successful');
var down_radio_packets_failure = new Gauge('down_radio_packets_failure', 'Downlink packets failed');
var down_radio_packets_collision_packet = new Gauge('down_radio_packets_collision_packet', 'Downlink packets collision with packet');
var down_radio_packets_collision_beacon = new Gauge('down_radio_packets_collision_beacon', 'Downlink packets collision with beacon');
var down_radio_packets_too_early = new Gauge('down_radio_packets_too_early', 'Downlink packets too early');
var down_radio_packets_too_late = new Gauge('down_radio_packets_too_late', 'Downlink packets too late');
var down_beacon_packets_queued = new Gauge('down_beacon_packets_queued', 'Beacon packets queued');
var down_beacon_packets_send = new Gauge('down_beacon_packets_send', 'Beacon packets send');
var down_beacon_packets_rejected = new Gauge('down_beacon_packets_rejected', 'Beacon packets rejected');

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
