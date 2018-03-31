# Fan control for DBRGN's backplane
FROM resin/raspberrypi3-debian:jessie

RUN apt-get update && \
    apt-get install git python-pip python-rpi.gpio && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /opt/ttn-fan

RUN git clone https://github.com/AmedeeBulle/ttn-fan.git

RUN pip install -r ./ttn-fan/requirements.txt

COPY run.sh ./

CMD ["/opt/ttn-fan/run.sh"]
