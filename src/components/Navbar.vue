<script setup>
import { reactive, toRefs } from 'vue';
import NavDropMenu from './NavDropMenu.vue';

const dropData = reactive({
    showDrop: false
})

const toggleDrop = () => {
    dropData.showDrop = !dropData.showDrop
}

const closeDrop = () => {
    dropData.showDrop = false
}

//const text = ref(window.test.testFunc())
</script>


<template>
    <div>
        <ul>
            <li @click="toggleDrop()">Menü</li>
        </ul>
    </div>
    <div v-show="dropData.showDrop" >
        <NavDropMenu @close="closeDrop"/>
    </div>
</template>



<style scoped>
div ul{
    display: flex;
    flex-direction: row;
    list-style: none;
    border-bottom: 1px solid;
    background-color: rgb(255, 136, 0);
}
div ul li {
    font-size: 20px;
    font-weight: 600;
    padding: 15px;
    text-shadow: 0px 2px 8px;
    transition: .3s;
    cursor: pointer;
}

div ul li:hover {
    background-color: black;
    color: white;
    text-shadow: 0px 2px 8px white;
    
}
</style>