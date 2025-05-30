<script setup>
import { ref, onMounted, watch ,computed} from 'vue'; // Importa funções do Vue para reatividade e manipulação do ciclo de vida
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar dados do usuário autenticado
import { FilterMatchMode } from 'primevue/api'; // Importa a API de filtros do PrimeVue para filtrar a tabela
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de spinner de carregamento
import estoqueService from '@/services/estoqueService';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// Declara as variáveis reativas
const loading = ref(false); // Variável para controlar o estado de carregamento
const relatorio = ref({ id_ : '' }); // Objeto para armazenar dados do filtro de   (Documento de Movimentação)
const todosOption = { label: 'Todos', value: null }; // Opção para o filtro de   para mostrar todos
const dropdown1 = ref(null); // Referência para o dropdown de  
const Estoque  = ref([]); // Lista de itens de estoque filtrados
const  s = ref([todosOption]); // Lista de   com a opção de "Todos"
const store = useAuthStore(); // Instancia o store de autenticação
const emptyMessage = computed(() => t('no_search_made')); // Mensagem a ser exibida quando não houver dados

// Filtros para a DataTable
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para busca na tabela
});

// Variável para controlar o número de registros filtrados
const filteredCount = ref(0);

/**
 * Função para buscar as  's (Documentos de Movimentação) e preencher a lista ` s`
 * Espera que a resposta da API retorne um array de objetos contendo 'ID_ ' e 'Identificacao'
 */
const fetch  = async () => {
    const data = { id_cliente: store.userIdCliente }; // Dados da requisição, incluindo o ID do cliente do usuário autenticado

    try {
        // Envia a requisição para buscar as  's
        const response = await estoqueService.listarEstoque (data);

        // Preenche a lista de  's, adicionando a opção "Todos"
         s.value = [
            todosOption,
            ...response.data.map(({ ID_ , Identificacao }) => ({
                label: `${Identificacao}`, // Exibe a identificação da  
                value: ID_  // Valor da  
            }))
        ];
    } catch (error) {
        // Se ocorrer erro ao buscar as  's, exibe no console
        console.error('Erro ao carregar lista de  s:', error);
    }
};

/**
 * Função para gerar o relatório de estoque das  's selecionadas
 * Espera que a resposta da API retorne uma lista de itens de estoque
 */
const relatorio  = async () => {
    loading.value = true; // Ativa o estado de carregamento

    const data = {
        id_cliente: store.userIdCliente, // ID do cliente autenticado
        id_usuario: store.userId, // ID do usuário autenticado
        id_ : relatorio.value.id_  // ID da   selecionada
    };

    try {
        // Envia a requisição para gerar o relatório de estoque
        const response = await estoqueService.relatorioEstoque (data);

        // Preenche a lista de Estoque  com a resposta da API
        Estoque .value = response.data;

        // Atualiza o contador de registros filtrados
        filteredCount.value = Estoque .value.length;
    } catch (error) {
        // Se ocorrer erro ao gerar o relatório, exibe no console
        console.error('Erro ao gerar o Relatorio de Estoque das  S:', error);
    } finally {
        loading.value = false; // Desativa o estado de carregamento
    }
};
const getTooltipText = (data) => {
    if (data.modelo === '2018') {
        return t('placa_mola');
    } else if (data.modelo === '2023') {
        return t('andar_posicao');
    } else {
        return t('placa_motor');
    }
};

/**
 * Observa o filtro global e atualiza o contador de registros filtrados.
 * A cada mudança no valor de `filters.global.value`, o contador de registros filtrados é atualizado.
 */
watch(
    () => filters.value.global.value, // Observa o valor do filtro global
    () => {
        // Filtra os itens do Estoque  com base no valor do filtro global
        filteredCount.value = Estoque .value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro e converte para minúsculas
            // Verifica se algum campo do item contém o valor do filtro
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue));
        }).length; // Atualiza o contador de registros filtrados
    },
    { immediate: true } // Chama imediatamente após a montagem para garantir que o filtro esteja pronto
);

/**
 * Função chamada quando o componente é montado.
 * Chama `fetch ` para carregar os dados iniciais das  's.
 */
onMounted(() => {
    fetch (); // Carrega as  's quando o componente é montado
});

//truncar texto acima de 15 caracteres
const truncatedText = (text) => {
    return text.length > 40 ? text.substring(0, 40) + '...' : text;
};
</script>

<template>
    <div class="card vh">
        <!-- Contêiner principal da tela -->
        <!-- Título da página <h5 class="my-6 ml-2 text-2xl">{{$t(' _inventory')}}</h5>-->
        <!-- Dropdown para seleção de   -->
        <div class="my-2">
            <label for=" " class="ml-2">{{$t('dispenser_machine')}}:</label>
            <Dropdown id=" " filter style="width: 200px" v-model="relatorio.id_ " :options=" s" ref="dropdown1" optionLabel="label" optionValue="value" :placeholder="$t('all')" class="mb-2 ml-2" @change="relatorio ()" />
        </div>

        <!-- Tabela de Estoque -->
        <DataTable
            class="mt-3"
            v-model:filters="filters"
            :value="Estoque "
            stripedRows
            showGridlines
            removableSort
            paginator
            :rows="10"
            dataKey="SKU"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :globalFilterFields="['sku', 'nome', 'Posicao', 'quantidade', 'quantidademinima', 'capacidade']"
            selectionMode="single"
            :metaKeySelection="false"
            :sortOrder="1"
            :sortField="'sku'"
            size="Normal"
            columnResizeMode="fit">
            <!-- A tabela exibe os dados provenientes da variável 'Estoque ' com várias funcionalidades de interatividade, como filtros, paginação e ordenação. -->
            <!-- O usuário pode filtrar os dados globalmente usando os campos definidos em ':globalFilterFields', como 'sku', 'nome', 'Posicao', 'quantidade', etc. -->
            <!-- A tabela suporta a ordenação inicial pelo campo 'sku' em ordem crescente e permite que o usuário remova a ordenação clicando novamente na coluna. -->
            <!-- A paginação é ativada, permitindo que o usuário navegue pelos dados divididos em páginas, com a opção de escolher quantas linhas exibir por página (5, 10, 20 ou 50). -->
            <!-- As linhas da tabela são listradas e as linhas de grade são exibidas para melhorar a legibilidade dos dados. -->
            <!-- O estilo de "min-width: 50rem" garante que a tabela tenha uma largura mínima, enquanto o layout fixo organiza as colunas de forma clara e consistente. -->

            <!-- Cabeçalho da tabela -->
            <template #header>
                <div class="flex justify-content-between align-items-center">
                    <div>
                        <span>{{$t('total_records',{count: filteredCount})}}</span>
                        <!-- Exibe o total de registros filtrados -->
                    </div>
                    <div>
                        <!-- Filtro global -->
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                                <!-- Ícone de pesquisa -->
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                            <!-- Campo de pesquisa -->
                        </IconField>
                    </div>
                </div>
            </template>

            <!-- Mensagem a ser exibida quando não houver dados -->
            <template #empty>  {{ $t('empty_message') }}</template>

            <!-- Definição das colunas da tabela -->
            <Column field="sku" class="table-cell" sortable style="width: 8%;" :header="t('SKU')">
            
                <template #body="{ data }">
                    <span class="tooltip-target" v-tooltip="data.sku">{{ truncatedText(data.sku) }}</span>
                </template>
            
            </Column>
            <Column field="nome" class="table-cell" sortable :header="t('product')">
                <template #body="{ data }">
                    <span class="tooltip-target" v-tooltip="data.nome">{{ truncatedText(data.nome) }}</span>
                </template>
            </Column>
            <Column field="Posicao" sortable style="width: 10%; text-align: center" :header="t('position')">
                <template #body="{ data }">
                    <span v-tooltip="getTooltipText(data)">
                        {{ data.Posicao }}
                    </span>
                    <!-- Exibe a posição do produto com tooltip condicional -->
                </template>
            </Column>
            <Column :field="t('quantity')" sortable style="width: 12%; text-align: center">
                <template #header>
                    <span v-tooltip="$t('current_quantity')">{{t('current_quantity_short')}}</span>
                    <!-- Tooltip para a coluna de quantidade -->
                </template>
            </Column>
            <Column field="quantidademinima" sortable style="width: 12%; text-align: center">
                <template #header>
                    <span v-tooltip="$t('minimum_quantity')">{{t('minimal_quantity')}}</span>
                    <!-- Tooltip para a coluna de quantidade mínima -->
                </template>
            </Column>
            <!-- Coluna para capacidade -->
            <Column field="capacidade" sortable style="width: 10%; text-align: center" :header="t('capacity')"></Column>
        </DataTable>

        <!-- Spinner de carregamento exibido enquanto a requisição está em andamento -->
        <LoadingSpinner v-if="loading" />
    </div>
</template>

<style>
.card {
    overflow-x: auto; /* Permite rolagem horizontal quando o conteúdo exceder a largura */
}

.datatable-wrapper {
    overflow-x: auto; /* Permite rolagem horizontal da tabela */
    width: 100vw; /* Largura total da tela */
}

.filtrar {
    margin-top: 25px; /* Espaçamento superior */
}

.drop {
    width: 100%; /* Largura total do dropdown */
}

@media (max-width: 580px) {
    .form .field {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 1rem;
    }

    .form .field .drop {
        width: 100%;
    }

    .form .field .filtrar,
    .form .field .exportar {
        width: 100%;
    }
}

.field {
    white-space: nowrap; /* Impede quebra de linha */
    text-align: left; /* Alinha o texto à esquerda */
}

.table-cell {
    overflow: hidden; /* Oculta o texto que excede o tamanho da célula */
    white-space: nowrap; /* Impede quebra de linha */
    text-overflow: ellipsis; /* Exibe reticências (...) quando o texto excede o tamanho */
}

/* Estilos para a exibição de tooltip */
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {
    max-width: 400px;
    white-space: normal;
}
</style>
