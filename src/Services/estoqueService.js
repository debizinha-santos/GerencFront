import axios from '@/axios.js';

const postRequest = async (url, data) => {
    try {
        const response = await axios.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};

const estoqueService = {
    async listarEstoque (data) {
        return postRequest('/Estoque/listar', data);
    },
    async relatorioEstoque (data) {
        return postRequest('/Estoque/relatorio', data);
    }

};

export default estoqueService;