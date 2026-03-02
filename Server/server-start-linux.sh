# Rule the words! DE LZB KKuTu
# You can see this file in <https://github.com/minjun1177/DE-LZB-KKuTu>

#!/usr/bin/env bash
export KKT_SV_NAME='DE LZB KKuTu'
echo "KKT_SV_NAME=${KKT_SV_NAME}"
sh -c 'nohup node lib/Game/cluster.js 0 1 > game.log 2>&1 &' && sleep 1
sh -c 'nohup node lib/Web/cluster.js 1 > web.log 2>&1 &'