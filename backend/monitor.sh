#!/bin/bash

echo "🔥 NEXUSCHAT ULTIMATE LOAD TEST MONITOR 🔥"
echo "=========================================="
echo ""

while true; do
    clear
    echo "╔════════════════════════════════════════════════════╗"
    echo "║              SYSTEM RESOURCES                      ║"
    echo "╠════════════════════════════════════════════════════╣"
    
    # CPU Usage
    CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    echo "║  CPU Usage:    $CPU%                                    ║"
    
    # Memory Usage
    MEM=$(free -m | awk 'NR==2{printf "%.1f", $3*100/$2}')
    echo "║  Memory Usage: $MEM%                                   ║"
    
    # Node processes
    NODE_COUNT=$(ps aux | grep node | wc -l)
    echo "║  Node Processes: $NODE_COUNT                                  ║"
    
    # Network connections
    CONN=$(ss -tan | grep 5000 | wc -l)
    echo "║  Port 5000 connections: $CONN                             ║"
    
    echo "╚════════════════════════════════════════════════════╝"
    
    # Check for failure signs
    if (( $(echo "$CPU > 90" | bc -l) )); then
        echo "⚠️  WARNING: CPU near limit!"
    fi
    
    if (( $(echo "$MEM > 90" | bc -l) )); then
        echo "⚠️  WARNING: Memory near limit!"
    fi
    
    if [ $CONN -gt 1000 ]; then
        echo "⚠️  High connection count: $CONN"
    fi
    
    sleep 2
done
