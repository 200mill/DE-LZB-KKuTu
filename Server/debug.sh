#!/bin/bash

# Rule the words! DE LZB KKuTu
# You can see this file in <https://github.com/minjun1177/DE-LZB-KKuTu>

# Do not use this. Use monitor.sh

# color
RED='\e[0;31m'
GRE='\e[0;32m'
YEL='\e[0;33m'
NOC='\e[0m'

CPU_TEMP=$(cat /sys/class/thermal/thermal_zone0/temp)

# cpu temp
echo -n 'cpu_temp     = '
TEMP_C=$((CPU_TEMP/1000))

if [ "$CPU_TEMP" -ge 50000 ]; then
        COLOR=$RED
elif [ "$CPU_TEMP" -ge 43000 ]; then
        COLOR=$YEL
else
        COLOR=$GRE
fi

# Print temp value with color
printf "${COLOR}%s${NOC}" "$CPU_TEMP"

# Bar logic
BAR_MAX_LEN=20
BAR_LEN=$(( TEMP_C * BAR_MAX_LEN / 100 ))
if [ "$BAR_LEN" -gt "$BAR_MAX_LEN" ]; then
    BAR_LEN=$BAR_MAX_LEN
fi

# Build bar string
BAR=""
i=1
while [ $i -le $BAR_MAX_LEN ]; do
    if [ "$i" -le "$BAR_LEN" ]; then
        BAR="${BAR}■"
    else
        BAR="${BAR} "
    fi
    i=$((i+1))
done

# Print bar with color
printf " [${COLOR}%s${NOC}]\n" "$BAR"

# cooler spd
echo -n 'cooler_speed = ' && cat /sys/devices/platform/cooling_fan/hwmon/*/pwm1
echo -n 'RPM          = ' && cat /sys/devices/platform/cooling_fan/hwmon/*/fan1_input
cat /sys/kernel/debug/pwm | grep cooling_fan

# is kkutu alive
if pgrep -f "Server/lib/Game/cluster.js" >/dev/null; then
        printf "\nKKuTu Game ${GRE}●${NOC}\n"
        tail -n 7 game.log
else
        printf "\nKKuTu Game ${RED}●${NOC}\n"
fi

if pgrep -f "Server/lib/Web/cluster.js" >/dev/null; then
        printf "\nKKuTu Web ${GRE}●${NOC}\n"
        tail -n 7 web.log
else
        printf "\nKKuTu Web ${RED}●${NOC}\n"
fi
