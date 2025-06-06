<script setup>
import VueDatePicker from '@vuepic/vue-datepicker'; // Importa o componente de data picker para selecionar as datas
import { FilterMatchMode } from 'primevue/api'; // Importa o modo de correspondência para filtros no PrimeVue
import { useToast } from 'primevue/usetoast'; // Importa o hook do PrimeVue para mostrar notificações
import '@vuepic/vue-datepicker/dist/main.css'; // Importa o CSS do componente de data picker
import { ref, onMounted, watch, computed } from 'vue'; // Importa funções do Vue para reatividade e manipulação de ciclo de vida
import axios from '@/axios.js'; // Importa a configuração do Axios para fazer requisições HTTP
import { useAuthStore } from '@/store/authStore.js'; // Importa o store de autenticação para acessar dados de usuário
import { useDataStore } from '@/store/dataStore.js'; // Importa o store de dados para acessar listas e informações
import LoadingSpinner from '@/components/LoadingSpinner.vue'; // Importa o componente de carregamento
import relatorioService from '@/Services/relatorioService.js'; // Importa o serviço de relatórios para buscar dados
import {filtroGenericoReltorio,gerarEbaixarCSV,gerarEbaixarJSON, isMobileDevice} from '@/helpers/HelperUtils.js'; // Importa a função de filtro genérico
import { useI18n } from 'vue-i18n';

import exportJson from '@/assets/images/export_json.png'; // Importa o ícone de exportação json
import exportCsv from '@/assets/images/export_csv.png'; // Importa o ícone de exportação csv

const { t } = useI18n();
const dataStore = useDataStore(); // Instancia o store de dados
const showDialog = ref(false); // Estado reativo para controlar a visibilidade de uma caixa de diálogo
const dialogMessage = ref(''); // Estado reativo para armazenar a mensagem a ser exibida no diálogo

const filteredCount = ref(0); // Conta os itens filtrados para exibição

const store = useAuthStore(); // Instancia o store de autenticação
const toast = useToast(); // Instancia o hook de toast para notificações

const emptyMessage = computed(() => t('no_search_made')); // Mensagem padrão quando não há resultados
const dropdown1 = ref(null); // Referência para o primeiro dropdown
const dropdown2 = ref(null); // Referência para o segundo dropdown
const dropdown3 = ref(null); // Referência para o terceiro dropdown
const dropdown4 = ref(null); // Referência para o quarto dropdown
const dropdown5 = ref(null); // Referência para o quinto dropdown

const devolucoes = ref([]); // Lista de devoluções retornadas pela API

const todosOption = { label: 'Todos', value: null }; // Opção de "Todos" para dropdowns

const  s = ref([todosOption]); // Lista de  s (dados de movimentação) para o filtro
const plantas = ref([todosOption]); // Lista de plantas para o filtro
const centroCusto = ref([todosOption]); // Lista de centros de custo para o filtro

const ListaFuncionariosOriginal = ref([]); // Lista original de funcionários
const ListaFuncionarios = ref([]); // Lista de funcionários filtrada

const ListaSetorOriginal = ref([]); // Lista original de setores
const ListaSetor = ref([]); // Lista de setores filtrada

// Filtros gerais para a tabela
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS } // Filtro global para pesquisa na tabela
});

const show = ref(true); // Estado reativo para controlar a exibição da tabela de dados

const selectedItem = ref([]); // Estado reativo para armazenar item selecionado

const loading = ref(false); // Estado reativo para controlar a exibição do spinner de carregamento

// Objeto do relatório com filtros aplicados
const relatorio = ref({
    id_ : '',
    id_planta: '',
    id_centro_custo: '',
    id_setor: '',
    id_funcionario: '',
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Data inicial (primeiro dia do mês)
    data_final: new Date() // Data final (data atual)
});

/**
 * Função para formatar uma data no formato dd/MM/yyyy.
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada no padrão "dd/MM/yyyy"
 */
const format = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Meses começam do 0, então somamos 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

// Função para converter a data para o formato ISO
const toISODate = (date) => {
    return date ? new Date(date).toISOString() : null;
};

// Função para buscar as devoluções de acordo com os filtros selecionados
const buscar = async () => {
    const data = {
        id_cliente: store.userIdCliente, // ID do cliente (proveniente do store de autenticação)
        id_ : relatorio.value.id_  === null ? undefined : relatorio.value.id_ , // Filtro de  , se não estiver vazio
        id_funcionario: relatorio.value.id_funcionario === null ? undefined : relatorio.value.id_funcionario, // Filtro de funcionário, se não estiver vazio
        data_inicio: toISODate(relatorio.value.data_inicio), // Data de início
        data_final: toISODate(relatorio.value.data_final) // Data de término
    };
    try {
        loading.value = true; // Ativa o carregamento enquanto a requisição é realizada
        const response = await axios.post('devolucoes/relatorio', data, {
            headers: {
                Authorization: `Bearer ${store.token}` // Passa o token de autenticação no cabeçalho
            }
        });
        devolucoes.value = response.data; // Armazena os dados retornados pela API na variável devolucoes

        filteredCount.value = devolucoes.value.length; // Atualiza o contador de registros filtrados

        // Se não houver resultados, exibe uma mensagem de erro
        if (Array.isArray(devolucoes.value) && devolucoes.value.length === 0) {
            dialogMessage.value = t('no_data_found');
            showDialog.value = true; // Abre a caixa de diálogo com a mensagem de erro
        }
        // Se não houver resultados, altera a mensagem padrão
        if (devolucoes.value.length === 0) {
            emptyMessage.value = t('no_data_found');
        } else {
            emptyMessage.value = ''; // Limpa a mensagem se houver resultados
        }
    } catch (error) {
        console.error('Erro ao buscar devoluções:', error); // Exibe erro no console caso a requisição falhe
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

// Reage a mudanças no filtro global e atualiza o contador de registros filtrados
watch(
    () => filters.value.global.value,
    () => {
        filteredCount.value = devolucoes.value.filter((item) => {
            const filterValue = filters.value.global.value?.toLowerCase() || ''; // Obtém o valor do filtro
            return Object.values(item).some((val) => val && val.toString().toLowerCase().includes(filterValue)); // Verifica se algum campo corresponde ao filtro
        }).length;
    },
    { immediate: true }
);

// Função para voltar à visualização da tabela após a visualização de um item
const voltar = () => {
    show.value = true; // Exibe a tabela de dados
    selectedItem.value = {}; // Limpa o item selecionado
};
const dt = ref(null); // Referência para o DataTable


// Função para exportar os dados em formato CSV
const exportCSV = () => {
    gerarEbaixarCSV('Devoluções', devolucoes.value);
};

// Função para exportar os dados em formato JSON
const exportJSON = () => {
    gerarEbaixarJSON('Devoluções', devolucoes.value);
};

// Função para fechar todos os dropdowns
const closeAllDropdowns = () => {
    if (dropdown1.value?.overlayVisible) dropdown1.value.hide(); // Fecha o primeiro dropdown
    if (dropdown2.value?.overlayVisible) dropdown2.value.hide(); // Fecha o segundo dropdown
    if (dropdown3.value?.overlayVisible) dropdown3.value.hide(); // Fecha o terceiro dropdown
    if (dropdown4.value?.overlayVisible) dropdown4.value.hide(); // Fecha o quarto dropdown
    if (dropdown5.value?.overlayVisible) dropdown5.value.hide(); // Fecha o quinto dropdown
};

// Função para carregar os dados iniciais dos filtros
const loadData = async () => {
    loading.value = true;
    try {
        // O operador || verifica se o valor já está armazenado no store, caso contrário, faz a chamada para obter os dados
         s.value = dataStore. s || (await dataStore.fetchLista s()); // Carrega a lista de  s
        plantas.value = dataStore.plantas || (await dataStore.fetchPlantas()); // Carrega a lista de plantas
        ListaSetorOriginal.value = dataStore.setores || (await dataStore.fetchSetores()); // Carrega a lista de setores
        ListaSetor.value = ListaSetorOriginal.value; // Carrega a lista de setores
        centroCusto.value = dataStore.cdcs || (await dataStore.fetchCdc()); // Carrega a lista de centros de custo
        ListaFuncionariosOriginal.value = await relatorioService.listaFuncionario();
        ListaFuncionarios.value = ListaFuncionariosOriginal.value; // Carrega a lista de funcionários
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error); // Exibe erro caso haja falha no carregamento dos dados
    } finally {
        loading.value = false; // Desativa o carregamento
    }
};

const filtroGenerico = () => {
    filtroGenericoReltorio(relatorio, ListaFuncionariosOriginal, ListaFuncionarios, ListaSetorOriginal, ListaSetor);
};
// Função chamada quando o datepicker é aberto, fecha todos os dropdowns
const handleDatepickerOpen = () => {
    closeAllDropdowns(); // Fecha todos os dropdowns
};

const isMobile = isMobileDevice();

// Função chamada quando o componente é montado
onMounted(() => {
    loadData(); // Carrega os dados iniciais
});
</script>

<template>
    <div class="card vh">
        <div class="form">
            <div class="text-center">
        <!--<h5 class="my-6 ml-2 text-2xl">{{t('devolucoes')}}</h5>-->
                
                <div class="p-0 m-0 p-fluid formgrid grid col-12" v-if="show">
                    <!-- div de busca de informações para o relatorio -->
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="id_ ">{{t(' ')}}:</label>
                        <Dropdown filter class="drop" v-model="relatorio.id_ " :options=" s" optionLabel="label" optionValue="value" ref="dropdown1" :placeholder="$t('all')" ></Dropdown>
                    </div>

                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">{{t('cost_center')}}</label>
                        <Dropdown filter class="drop" v-model="relatorio.id_centro_custo" :options="centroCusto" optionLabel="label" optionValue="value" :placeholder="$t('all')"  ref="dropdown3" @change="filtroGenerico" />
                    </div>
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="perfil">{{t('sector')}}</label>
                        <Dropdown filter class="drop" v-model="relatorio.id_setor" :options="ListaSetor" optionLabel="label" optionValue="value":placeholder="$t('all')"  ref="dropdown4" @change="filtroGenerico" />
                    </div>
                    <div class="field py-0 my-0 xl:col-3 lg:col-6 md:col-6 sm:col-12">
                        <label for="planta">{{t('factory')}}:</label>
                        <Dropdown filter class="drop" v-model="relatorio.id_planta" :options="plantas" optionLabel="label" optionValue="value" :placeholder="$t('all')"  ref="dropdown2" @change="filtroGenerico" />
                    </div>
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('employee')}}:</label>
                        <Dropdown filter class="drop" v-model="relatorio.id_funcionario" :options="ListaFuncionarios" optionLabel="label" optionValue="value" :placeholder="$t('all')"  ref="dropdown5" />
                    </div>
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('initial_date')}}:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_inicio"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            :placeholder="$t('initial_date_placeholder')"
                            teleport="body"
                            ref="datepicker1"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <label for="perfil">{{t('end_date')}}:</label>
                        <VueDatePicker
                            class="drop"
                            v-model="relatorio.data_final"
                            showIcon
                            :showOnFocus="false"
                            :format="format"
                            locale="pt-BR"
                            auto-apply
                            :enable-time-picker="false"
                            :placeholder="$t('end_date_placeholder')"
                            teleport="body"
                            ref="datepicker2"
                            @open="handleDatepickerOpen"
                        />
                    </div>
                    <div class="field py-0 mt-2 xl:col-3 lg:col-4 md:col-6 sm:col-12">
                        <!-- botão de filtrar -->
                        <Button class="filtrar" type="button" :label="$t('filter_data')" icon="pi pi-search" severity="info" @click="buscar" />
                    </div>

                    <!-- Botão para exportar dados em CSV -->
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6" v-if="isMobile">
                        <Button class="exportar" icon="pi pi-file" :label="$t('export_csv')" @click="exportCSV"></Button>
                    </div>

                    <!-- Botão para exportar dados em JSON -->
                    <div class="field xl:col-3 lg:col-4 md:col-6 sm:col-6" v-if="isMobile">
                        <Button class="exportar" icon="pi pi-file" :label="$t('export_json')" @click="exportJSON"></Button>
                    </div>
                </div>
            </div>

            <!-- WEB - Se for mobile não é para mostrar esse ícones -->
        </div>
        <div v-if="!isMobile" class="flex justify-content-start align-items-center">
            <!-- Imagem para exportar dados em CSV -->
            <div class="">
                <img :src="exportCsv" alt="Export CSV" @click="exportCSV" style="cursor: pointer" width="70" height="70" />
            </div>

            <!-- Imagem para exportar dados em JSON -->
            <div class="">
                <img :src="exportJson" alt="Export JSON" @click="exportJSON" style="cursor: pointer" width="70" height="70" />
            </div>
        </div>

                <!--  datatable do relatorio -->
                <div class="mt-6">
                    <DataTable
                        v-model:filters="filters"
                        :value="devolucoes"
                        stripedRows
                        showGridlines
                        removableSort
                        paginator
                        :rows="10"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        rowHover
                        :globalFilterFields="['ID_ ', 'Dia', 'matricula', 'nome', 'email', 'ProdutoNome', 'Quantidade', 'ProdutoSKU']"
                        :tableStyle="{ width: '100%' }"
                        ref="dt"
                        class=""
                        :sortOrder="1"
                        :sortField="'ProdutoSKU'"
                    >
                        <!-- A tabela exibe os dados provenientes de 'devolucoes', com funcionalidades de filtros, ordenação, paginação e exibição de linhas listradas. -->
                        <!-- O usuário pode interagir com os dados através de filtros globais e pode classificar os dados clicando nas colunas da tabela. -->
                        <!-- A tabela tem uma funcionalidade de paginação que divide os dados em páginas de 10 itens por vez, com opções de 5, 10, 20 ou 50 itens por página. -->
                        <!-- A ordenação inicial é configurada para o campo 'ProdutoSKU', com a ordem crescente (1). -->
                        <!-- O efeito de destaque de linhas e a exibição das linhas de grade facilitam a leitura e a interação com a tabela. -->

                        <template #header>
                            <div class="flex justify-content-between align-items-center">
                                <div class="flex justify-content-start">
                                    <span>{{$t('total_records',{count: filteredCount})}}</span>
                                </div>
                                <div>
                                    <IconField iconPosition="left">
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="filters['global'].value" :placeholder="t('search')" />
                                    </IconField>
                                </div>
                            </div>
                        </template>

                        <template #empty> {{ emptyMessage }} </template>
                        <Column field="ID_ " sortable  :header="t(' ')"></Column>
                        <Column field="Dia" sortable :header="t('date')">></Column>
                        <Column field="matricula" sortable :header="t('employee_id')"></Column>
                        <Column field="nome" sortable :header="t('name')"></Column>
                        <Column field="ProdutoNome" sortable :header="t('item')"></Column>
                        <Column field="Quantidade" sortable :header="t('quantity_short')" class="text-center"></Column>
                        <Column field="ProdutoSKU" :header="t('ca')"></Column>
                    </DataTable>
                </div>
                <Card v-if="!show">
                    <template #title>{{ selectedItem.id_  }}</template>
                    <template #content>
                        <Button type="button" label="Voltar" icon="pi pi-arrow-left" severity="info" @click="voltar" />
                    </template>
                </Card>
            
        
    </div>
    <LoadingSpinner v-if="loading" />

    <!--  mensagem de erro -->
    <Dialog header="Informação" :visible.sync="showDialog" style="width: 30vw" :modal="true" :closable="false" :draggable="false">
        <p>{{ dialogMessage }}</p>
        <template #footer>
            <Button label="OK" icon="pi pi-check" @click="showDialog = false" />
        </template>
    </Dialog>
</template>
<style>
/** 
 * .card
 * 
 * Estiliza o container `.card` para permitir o rolar horizontal do conteúdo.
 * Isso é útil quando o conteúdo excede a largura da caixa e você quer permitir a rolagem horizontal.
 */
.card {
    overflow-x: auto; /* Permite a rolagem horizontal quando o conteúdo excede a largura do contêiner */
}

/** 
 * .datatable-wrapper
 * 
 * Estiliza o wrapper da tabela (provavelmente um contêiner ao redor de uma DataTable),
 * garantindo que ele tenha rolagem horizontal e se ajuste à largura da tela.
 */
.datatable-wrapper {
    overflow-x: auto; /* Permite a rolagem horizontal quando o conteúdo excede a largura do contêiner */
    width: 100vw; /* Define a largura do contêiner para 100% da largura da janela de visualização (viewport) */
}

/** 
 * .filtrar
 * 
 * Aplica um espaçamento superior de 25px para o elemento com a classe `.filtrar`.
 * Isso pode ser utilizado para dar um espaço adequado entre os elementos de filtro ou controles.
 */
.filtrar {
    margin-top: 25px; /* Adiciona margem superior de 25px ao elemento */
}

/** 
 * .drop
 * 
 * Aplica largura de 100% ao elemento com a classe `.drop`, geralmente usado para controles de seleção.
 * Isso garante que o controle ocupe toda a largura disponível no seu contêiner pai.
 */
.drop {
    width: 100%; /* Define a largura do elemento para 100% da largura do contêiner pai */
}

/** 
 * @media (max-width: 580px)
 * 
 * Define regras específicas para telas menores ou iguais a 580px de largura.
 * Essas regras tornam a interface mais responsiva, ajustando a exibição de campos e controles.
 */
@media (max-width: 580px) {
    /** 
     * .form .field
     * 
     * Faz com que os campos de formulário se ajustem em telas pequenas.
     * A largura máxima será 100% e o campo ocupará toda a largura disponível do contêiner pai.
     */
    .form .field {
        flex: 0 0 100%; /* Faz o campo de formulário ocupar 100% da largura do contêiner */
        max-width: 100%; /* Garante que o campo de formulário tenha uma largura máxima de 100% */
        margin-bottom: 1rem; /* Adiciona um espaço de 1rem abaixo de cada campo */
    }

    /** 
     * .form .field .drop
     * 
     * Define que os controles de seleção dentro do campo de formulário também ocupem 100% da largura disponível,
     * garantindo que eles se ajustem corretamente em dispositivos móveis.
     */
    .form .field .drop {
        width: 100%; /* Define a largura do controle de seleção para 100% */
    }

    /** 
     * .form .field .filtrar, .form .field .exportar
     * 
     * Garante que os controles de filtro e exportação dentro do formulário ocupem toda a largura disponível
     * em dispositivos móveis, garantindo uma boa usabilidade.
     */
    .form .field .filtrar,
    .form .field .exportar {
        width: 100%; /* Define a largura do controle de filtro e exportação para 100% */
    }
}

/** 
 * .field
 * 
 * Estilo para campos de formulário que garante que o texto dentro do campo seja alinhado à esquerda.
 * Também evita que o texto ultrapasse a largura do campo e faz com que o conteúdo quebre se necessário.
 */
.field {
    white-space: nowrap; /* Evita que o texto dentro do campo quebre para a linha seguinte */
    text-align: left; /* Alinha o texto à esquerda */
}

/** 
 * .table-cell
 * 
 * Estilo para células de uma tabela, garantindo que o conteúdo não ultrapasse o tamanho da célula
 * e exibindo "..." (ellipsis) quando o texto for maior que o espaço disponível.
 */
.table-cell {
    overflow: hidden; /* Oculta qualquer conteúdo que ultrapasse o limite da célula */
    white-space: nowrap; /* Impede que o texto dentro da célula quebre em múltiplas linhas */
    text-overflow: ellipsis; /* Adiciona "..." quando o texto é cortado */
}
</style>
