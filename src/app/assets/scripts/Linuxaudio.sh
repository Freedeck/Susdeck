export LC_ALL=C
DEFAULT_OUTPUT=$(pactl info|sed -n -e 's/^.*Default Sink: //p')
if ! pactl info|grep -w "PipeWire">/dev/null; then
    pactl unload-module module-default-device-restore
fi
pactl load-module module-null-sink sink_name=susdeckin
pactl load-module module-null-sink sink_name=susdeckout
pactl load-module module-loopback source=susdeckout.monitor sink=susdeckin.monitor
pactl load-module module-remap-source master=susdeckout.monitor source_name=Susdeck source_properties=device.description=Susdeck