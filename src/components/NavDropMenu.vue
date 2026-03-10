<script setup>
import { ref, inject, defineEmits } from 'vue';

const emit = defineEmits(['close']); // Declare the event

const closeDrop = () => {
    emit('close');
};

const exit = () => {
    ref(window.API.exitProg());
};

let musicFiles = inject('musicFiles');

const choosDirectory = async() => {
    const result = await window.API.selectDirectory();
    if (result) {
        const directoryPath = result.directoryPath;
        musicFiles.value = result.musicFiles.map(fileName => `${directoryPath}/${fileName}`);
    }
    console.log(musicFiles.value);
};
</script>

<template>
    <div class="menu-drop" @click.self="closeDrop">
        <ul>
            <li @click="choosDirectory">Open Folder</li>
            <li id="exit" @click="exit">Exit</li>
        </ul>
    </div>
</template>

<style scoped>
div ul {
    display: flex;
    flex-direction: column;
    border-bottom-right-radius: 20px;
    background-color: rgb(255, 136, 0);
    justify-content: center;
    list-style: none;
    width: fit-content;
    box-shadow: 2px 2px 6px;
}

div ul li {
    font-size: 18px;
    font-weight: 600;
    padding: 10px;
    cursor: pointer;
    transition: .3s;  
}

div ul li:hover {
    background-color: black;
    color: white;
    text-shadow: 0px 2px 8px white;
}

div ul #exit {
    border-bottom-right-radius: 20px;
}

.menu-drop {
    position: fixed;
    z-index: 300;
    background-color: rgba(0, 255, 255, 0);
    height: 100%;
    width: 100%;
}

</style>