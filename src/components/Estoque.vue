<template>
    <div class="card vh">
        <!-- Contêiner principal da card com altura total da tela (vh) -->
        <h5 class="my-6 ml-2 text-2xl">Estoque da  </h5>
        <!-- Título principal da página com margens e tamanho de fonte -->

        <!-- Seção do filtro para selecionar a   -->
        <div class="my-2">
            <label for=" " class="ml-2"> :</label>
            <!-- Rótulo (label) para o Dropdown de   -->

            <!-- Componente Dropdown para selecionar a   -->
            <Dropdown id=" " style="width: 20%" v-model="selected " :options="props. s" optionLabel="label" optionValue="value" placeholder="Todos" class="mb-2 ml-2" />
        </div>

        <!-- Exibe um componente de LoadingSpinner caso a propriedade 'loading' seja verdadeira -->
        <LoadingSpinner v-if="loading" />

        <!-- Componente DataTable para exibir o estoque -->
        <DataTable
            class="mt-3"
            :value="filteredEstoque"
            stripedRows
            showGridlines
            removableSort
            paginator
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            selectionMode="single"
            :metaKeySelection="false"
            :sortOrder="1"
            :sortField="'Posicao'"
            :tableStyle="{ width: '100%' }"
        >
        <!-- Adiciona a classe "mt-3" à tabela, aplicando uma margem superior de 3rem -->
    <!-- Define o valor da tabela como "filteredEstoque", que contém os dados filtrados a serem exibidos -->
    <!-- Aplica o estilo de linhas listradas, alternando as cores de fundo entre as linhas -->
    <!-- Exibe as linhas de grade (linhas de divisão) da tabela -->
    <!-- Permite ao usuário remover a ordenação clicando na coluna que está sendo usada para ordenar -->
    <!-- Habilita a paginação para exibir os dados em várias páginas -->
    <!-- Define o número de linhas por página como 10 -->
    <!-- Define as opções de quantidade de itens por página que o usuário pode escolher (5, 10, 20, 50) -->
    <!-- Permite selecionar apenas uma linha por vez -->
    <!-- Desabilita a seleção de múltiplas linhas com a tecla "meta" (como Ctrl ou Command) -->
    <!-- Define a ordem de ordenação inicial (1 significa ordem crescente) -->
    <!-- Define o campo de ordenação inicial como "Posicao" -->
    <!-- Define o estilo da tabela para ocupar 100% da largura disponível -->
     
            <!-- Template para exibir uma mensagem caso não haja dados -->
            <template #empty>
                {{ emptyMessage }}  <!-- Exibe a mensagem de vazio definida em 'emptyMessage' -->
            </template>

            <!-- Coluna de SKU -->
            <Column field="sku" class="table-cell" sortable header="SKU" />
            <!-- Coluna de Produto -->
            <Column field="nome" sortable header="Produto">
                <!-- Exibe o nome do produto com tooltip -->
                <template #body="{ data }">
                    <span v-tooltip="data.nome">{{ data.nome }}</span>
                </template>
            </Column>
            <!-- Coluna de Posição com tooltip condicional -->
            <Column field="Posicao" sortable style="text-align: center" header="Posição">
                <template #body="{ data }">
                    <span
                        v-tooltip="data.modelo === '2018' ? 'Placa / Mola ' : data.modelo === '2023' ? 'Andar / Posição' : 'Placa / Motor'"
                    >
                        {{ data.Posicao }}  <!-- Exibe o valor da posição com tooltip baseado no modelo -->
                    </span>
                </template>
            </Column>
            <!-- Coluna de Quantidade Atual -->
            <Column field="quantidade" sortable style="text-align: center">
                <template #header>
                    <span v-tooltip="'Quantidade Atual'">Quant. Atual</span>  <!-- Tooltip explicativo no cabeçalho -->
                </template>
            </Column>
            <!-- Coluna de Quantidade Mínima -->
            <Column field="quantidademinima" sortable style="text-align: center">
                <template #header>
                    <span v-tooltip="'Quantidade Mínima'">Quant. Mín.</span>  <!-- Tooltip explicativo no cabeçalho -->
                </template>
            </Column>
            <!-- Coluna de Capacidade -->
            <Column field="capacidade" sortable style="text-align: center" header="Capacidade" />
        </DataTable>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';  // Importa as funções 'ref' e 'computed' do Vue para criação de variáveis reativas
import LoadingSpinner from '@/components/LoadingSpinner.vue';  // Importa o componente de carregamento

// Definindo a estrutura inicial do relatório
const relatorio = ref({
    id_ : ''
});

// Definindo as propriedades que são passadas ao componente (Props)
const props = defineProps({
    estoque: {
        type: Array,  // Define que 'estoque' é um array
        required: true  // 'estoque' é obrigatório
    },
     s: {
        type: Array,  // Define que ' s' é um array
        required: true  // ' s' é obrigatório
    },
    loading: {
        type: Boolean,  // 'loading' é um valor booleano
        required: true  // 'loading' é obrigatório
    }
});

// Filtro global para a pesquisa
const filters = ref({//ref é usado para reatividade
    global: { value: '' }//filtro global
});

// Mensagem exibida quando não há itens para mostrar
const emptyMessage = ref('Nenhum item encontrado.');//ref é usado para reatividade

// Variável reativa que representa o estado de carregamento
const loading = ref(false);//ref é usado para reatividade

// Variável reativa que contém o valor selecionado da  
const selected  = ref(null);//ref é usado para reatividade

// Computed que filtra os itens de estoque com base na   selecionada
const filteredEstoque = computed(() => {//computed é usado para criar variáveis computadas
    if (!selected .value) {//se não houver   selecionada
        emptyMessage.value = 'Nenhum item encontrado.';  // Se nenhuma   for selecionada, exibe mensagem padrão
        return props.estoque;  // Retorna todos os itens do estoque
    }
    // Obtém o label da   selecionada
    const selected Label = props. s.find(( ) =>  .value === selected .value)?.label || '  desconhecida';//encontra o label da   selecionada
    
    // Filtra o estoque com base no ID da   selecionada
    const resultadoFiltrado = props.estoque.filter((item) => item.ID_  === selected .value);//filtra o estoque com base no ID da   selecionada
    
    // Verifica se há itens após o filtro e ajusta a mensagem de vazio
    if (resultadoFiltrado.length === 0) {//se não houver itens após o filtro
        emptyMessage.value = `Nenhum item encontrado para a   selecionada (${selected Label}).`;//exibe mensagem de vazio personalizada
    } else {
        emptyMessage.value = '';  // Limpa a mensagem de vazio se houver itens
    }
    
    // Retorna o estoque filtrado
    return resultadoFiltrado;
});

</script>

<style>
.card {/* Define o estilo da card */
    padding: 1rem;  /* Adiciona um preenchimento de 1rem em todos os lados da card */
    border-radius: 0.5rem;  /* Arredonda os cantos da card */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  /* Adiciona uma sombra sutil ao redor da card */
    background-color: white;  /* Define o fundo da card como branco */
}
</style>
