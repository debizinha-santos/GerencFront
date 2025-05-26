<script setup>
import LogsStatus from '@/components/dashboard/LogsStatus.vue';
import Monitoring from '@/components/dashboard/Monitoring.vue';
import Notifications from '@/components/dashboard/Notifications.vue';
import Retiradas from '@/components/dashboard/Retiradas.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import TotalRetiradas from '@/components/dashboard/TotalRetiradas.vue';
import { useAuthStore } from '@/stores/auth';
import { io } from 'socket.io-client';
import { onMounted, ref } from 'vue';
const store = useAuthStore();

const retiradas = ref([]);
const logs = ref([]);
const notificacao = ref([]);
const monitoring = ref([]);

onMounted(() => {
    const socket = io('/', {// Adjust the URL as needed
        extraHeaders: {
            Authorization: 'Bearer ' + store.userToken
        }
    });

    console.log(store.userToken);
    socket.emit('logRequest');
    socket.emit('notificationRequest');
    socket.emit('retiradaRelatorioRequest');
    socket.on('logRequest', (data) => {
        console.log(data);
        logs.value = data;
    });

    socket.on('retiradaRelatorioRequest', (data) => {
        console.log(data);
        retiradas.value = data;
    });

    socket.on('notificationRequest', (data) => {
        console.log(data);
        notificacao.value = data;
    });

    socket.on('statusPooling', (data) => {
        console.log(data);
        monitoring.value = data;
    });
});
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />
        <div class="col-span-12 xl:col-span-12">
            <Monitoring :monitoring="monitoring" />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <Retiradas :ret="retiradas" />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <TotalRetiradas />
        </div>
        <div class="col-span-12 xl:col-span-12">
            <LogsStatus :log="logs" />
        </div>
        <div class="col-span-12 xl:col-span-12">
            <Notifications :notif="notificacao" />
        </div>
    </div>
</template>