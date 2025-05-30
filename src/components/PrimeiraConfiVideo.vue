<template>
    <!-- Div que contém a configuração inicial de vídeos -->
    <div class="config-inicial">
        <div class="">
            <!-- Exibe mensagem de erro caso ocorra algum problema -->
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <P class="mb-4 mt-6">{{ $t('select_ _for_upload') }}</P>
            <div class="card flex align-items-center justify-content-center">
                <!-- Verifica se há opções de   disponíveis -->
                <div class="flex grid my-2 flex justify-content-evenly flex-wrap" v-if=" Options.length > 0">
                    <div class="col-4">
                        <!-- Componente Listbox para selecionar a   -->
                        <Listbox v-model="selected " :options=" Options" filter optionLabel="label" class="mb-4" />
                    </div>

                    <Divider layout="vertical" />

                    <div class="file-upload">
                        <!-- Input para selecionar arquivos de vídeo -->
                        <input type="file" ref="fileInput" multiple accept=".mp4" @change="handleFiles" style="display: none" />
                    </div>

                    <!-- Caixa de diálogo de erro -->
                    <Dialog v-model:visible="showDialog" header="Erro!" :closable="false" :style="{ width: '300px' }" :draggable="false">
                        <p v-if="fileError" class="error">{{ fileError }}</p>
                    </Dialog>

                    <div class="col-3 my-3 p-0">
                        <!-- Botão para abrir o seletor de arquivos -->
                        <Button class="w-full" :label="$t('select_video')" icon="pi pi-folder-open" @click="triggerFileInput" />
                        <!-- Botão para enviar os vídeos -->
                        <Button class="my-2 w-full" :label="$t('send_all')" icon="pi pi-upload" @click="uploadVideos" :disabled="filesToUpload.length === 0 || isUploading" />
                        <!-- Botão de conclusão de setup, habilitado apenas quando pelo menos um vídeo foi enviado -->
                        <Button class="w-full concluido" severity="success" :label="$t('video_setup_completed')" icon="pi pi-check" @click="finalizarSetup" :disabled="!isAnyVideoUploaded" />
                    </div>

                    <Divider layout="vertical" />
                    <!-- Lista de vídeos selecionados para upload -->
                    <div class="col-4 file-list flex-wrap">
                        <div class="p-1 lista ">
                            <div v-for="(file, index) in filesToUpload" :key="index" class="file-list-item block w-full flex flex-column justify-content-start p-2" style="height: auto">
                                <!-- Título e Botão X em linha, alinhados -->
                                <div class="file-title-container flex justify-content-between align-items-center mb-2" style="width: 100%;">
                                    <span class="file-name flex-shrink-0 nowrap overflow-hidden	text-overflow-ellipsis max-w-full ">{{ file.customName }}</span> ( : {{ file. Id }})

                                    <!-- Botão "x" para remover o vídeo da lista -->
                                    <Button icon="pi pi-times" class="p-button-text m-0 p-button-danger  text-2xl text-red ml-2" style="font-size: 1.5rem; color: red" @click="removeVideo(index)" />
                                </div>

                                <!-- Barra de progresso abaixo <ProgressBar :value="100" class="mt-2 progress-bar min-h-2" style="width: 100%;" v-if="true" />-->
                                 
                                <ProgressBar :value="file.progress" class="my-2 progress-bar min-h-2" v-if="isUploading" />
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Mensagem exibida quando não há  s ou configuração já foi concluída -->
                <p v-else>Configuração inicial concluída!</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from '@/axios.js'; // Importa o axios para realizar requisições HTTP
import { ref, computed, defineProps, defineEmits } from 'vue'; // Funções do Vue para reatividade e manipulação de props
import { useToast } from 'primevue/usetoast'; // Importa a função de toast para exibir notificações
import videoService from '@/services/videoService';// Importa o serviço de vídeo para fazer upload
import { useI18n } from 'vue-i18n';
const toast = useToast(); // Instancia o objeto de notificações de toast
const { t } = useI18n();
// Propriedades recebidas pelo componente, espera uma lista de  s
const props = defineProps({
     List: Array // Recebe a lista de  s (Dispositivos de Mídia) como prop
});

const selected  = ref(null); //   selecionada pelo usuário
const filesToUpload = ref([]); // Lista de arquivos que serão enviados
const isUploading = ref(false); // Flag que indica se o upload está em andamento
const showDialog = ref(false);// Flag que controla a visibilidade do diálogo de erro
const fileError = ref(''); // Mensagem de erro caso o usuário tente adicionar arquivos inválidos
const uploadedVideos = ref(0); // Contador de vídeos enviados com sucesso

// Computed para gerar as opções da lista de  s (Identificação e ID)
const  Options = computed(() =>//computed é usado para criar variáveis computadas
    props. List.map(( ) => ({//mapeia a lista de  s
        label:  .Identificacao, // Nome do dispositivo
        value:  .ID_  // ID do dispositivo
    }))
);

// Função para remover um vídeo da lista de arquivos a serem enviados
const removeVideo = (index) => {//removeVideo é uma função que recebe um índice como parâmetro
    // Remove o vídeo da lista de arquivos
    filesToUpload.value.splice(index, 1); // Remove 1 item no índice especificado
};

// Função para emitir o evento de término do setup de vídeo
const emit = defineEmits(['setup-concluido']);//defineEmits é usado para definir os eventos emitidos pelo componente
const isAnyVideoUploaded = computed(() => uploadedVideos.value > 0); // Computed para verificar se ao menos um vídeo foi enviado

// Função que dispara o input de seleção de arquivos
const triggerFileInput = () => {//triggerFileInput é uma função que dispara o input de seleção de arquivos
    // Verifica se uma   foi selecionada
    if (!selected .value) {//se não houver   selecionada
        // Define a mensagem de erro com uma mensagem genérica
        toast.add({
            severity: 'warn',  // Define a severidade da notificação como aviso
            summary: 'Aviso',// Define o título da notificação
            detail: t('video_associated_ '),// Define o conteúdo da notificação
            life: 3000// Define o tempo de exibição da notificação
        });

        return; // Impede o processo de seleção de arquivos
    }

    // Caso uma   esteja selecionada, abre o seletor de arquivos
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {//se o input de arquivo existir
        fileInput.click(); // Abre a janela para selecionar arquivos
    }
};

// Função que emite o evento 'setup-concluido' para informar que o setup foi concluído
const finalizarSetup = () => {//finalizarSetup é uma função que emite o evento 'setup-concluido'
    emit('setup-concluido');//emite o evento 'setup-concluido'
};

// Função que manipula a seleção de arquivos de vídeo
const handleFiles = (event) => {//handleFiles é uma função que manipula a seleção de arquivos de vídeo
    const files = event.target.files; // Obtém os arquivos selecionados

    // Verifica se já existe um arquivo para a   selecionada
    const  IdSelected = selected .value.value; // ID da   selecionada

    const existingFile = filesToUpload.value.find((file) => file. Id ===  IdSelected);//verifica se já existe um arquivo para a   selecionada
    if (existingFile) {//se já existir um arquivo para a   selecionada
        toast.add({//exibe uma notificação de erro
            severity: 'error',// Define a severidade da notificação como erro
            summary: 'Erro',// Define o título da notificação
            detail: `Já existe um vídeo selecionado para a   "${selected .value.label}".`,// Define o conteúdo da notificação
            life: 3000// Define o tempo de exibição da notificação
        });
        return; // Impede a adição de um novo arquivo para a mesma  
    }

    // Verifica e valida cada arquivo
    for (const file of files) {//itera sobre os arquivos selecionados
        // Verifica se o arquivo não é do tipo mp4
        if (!file.type.includes('mp4')) {//se o arquivo não for do tipo mp4
            toast.add({//exibe uma notificação de erro
                severity: 'error',// Define a severidade da notificação como erro
                summary: 'Erro de Arquivo',// Define o título da notificação
                detail: 'Apenas arquivos .mp4 são permitidos.',// Define o conteúdo da notificação
                life: 3000// Define o tempo de exibição da notificação
            });
            continue; // Pula o arquivo inválido
        }

        // Verifica se o arquivo é maior que 5MB
        if (file.size > 50 * 1024 * 1024) {//se o arquivo for maior que 50MB
            toast.add({//exibe uma notificação de erro
                severity: 'error',// Define a severidade da notificação como erro
                summary: 'Erro de Arquivo',// Define o título da notificação
                detail: 'O tamanho do arquivo não pode exceder 50MB.',// Define o conteúdo da notificação
                life: 3000// Define o tempo de exibição da notificação
            });
            continue; // Pula o arquivo inválido
        }

        // Gera um nome customizado para o arquivo
        const generatedName = ` -${selected .value.label}-v1`;//gera um nome customizado para o arquivo

        // Adiciona o arquivo à lista de arquivos a serem enviados
        filesToUpload.value.push({//adiciona o arquivo à lista de arquivos a serem enviados
            file,// Adiciona o arquivo
             Id: selected .value.value,// Adiciona a ID da  
            customName: generatedName,// Adiciona o nome customizado do arquivo
            fileName: file.name,// Adiciona o nome original do arquivo
            progress: 0 // Inicializa o progresso do upload
        });
    }
};

// Função que faz o upload dos vídeos selecionados
const uploadVideos = async () => {//uploadVideos é uma função que faz o upload dos vídeos selecionados
    if (filesToUpload.value.length === 0) {//se não houver arquivos para enviar
        toast.add({//exibe uma notificação de aviso
            severity: 'warn',// Define a severidade da notificação como aviso
            summary: 'Nenhum Arquivo',//    Define o título da notificação
            detail: 'Adicione arquivos antes de enviar.',// Define o conteúdo da notificação
            life: 3000// Define o tempo de exibição da notificação
        });
        return; // Retorna se não houver arquivos para enviar
    }

    isUploading.value = true; // Ativa o flag de upload

    // Envia cada arquivo individualmente
    for (const item of filesToUpload.value) {   //itera sobre os arquivos a serem enviados
        const formData = new FormData();    // Cria um objeto FormData para enviar o arquivo
        formData.append('video', item.file); // Adiciona o arquivo
        formData.append(' Id', item. Id); // Adiciona a ID da  
        formData.append('fileName', item.fileName); // Adiciona o nome original do arquivo
        formData.append('customName', item.customName); // Adiciona o nome customizado do arquivo

        try {   //tenta fazer o upload do arquivo
            await videoService.uploadVideo( // Faz o upload do vídeo
                item.file,  // Arquivo a ser enviado
                item. Id,  // ID da  
                item.customName,    // Nome customizado do arquivo
                (progressEvent) => {    // Função de progresso
                    item.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100); // Atualiza o progresso
                }
            );

            uploadedVideos.value++; // Incrementa o contador de vídeos enviados com sucesso

            // Exibe notificação de sucesso
            toast.add({   //exibe uma notificação de sucesso
                severity: 'success',    // Define a severidade da notificação como sucesso
                summary: 'Upload Concluído',    // Define o título da notificação
                detail: `Arquivo "${item.fileName}" foi enviado como "${item.customName}"`,   // Define o conteúdo da notificação
                life: 3000  // Define o tempo de exibição da notificação
            });
        } catch (error) {   //captura o erro caso o upload falhe
            console.error('Erro ao fazer upload:', error);  // Exibe o erro no console
            // Exibe notificação de erro caso o upload falhe
            toast.add({  //exibe uma notificação de erro
                severity: 'error',  // Define a severidade da notificação como erro
                summary: 'Erro de Upload',  // Define o título da notificação
                detail: `Falha ao enviar o vídeo "${item.fileName}".`,  // Define o conteúdo da notificação
                life: 3000  // Define o tempo de exibição da notificação
            });
        }
    }

    filesToUpload.value = []; // Limpa a lista de arquivos após o upload
    isUploading.value = false; // Desativa o flag de upload
};
</script>
<style scoped>
/* Container do item da lista */
.file-list-item {
    border-bottom: 1px solid #ccc; /* Linha divisória entre os itens */
}

</style>
