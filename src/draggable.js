import Common from '@/common';

export default {
    inserted(el, binding, vnode) {
        const listeners = Common.getListeners(vnode);
        let dragData = binding.value;
        let handler = null;

        el.setAttribute('draggable', true);
            
        if (binding.modifiers && binding.modifiers.move) {
            el.style.cursor = 'move';
        }

        if(binding.value.handler !== undefined) {
            dragData = binding.value.data;
            handler = el.getElementsByClassName(binding.value.handler)[0];

            if(handler !== undefined) {
                el.setAttribute('draggable', false);
                el.style.cursor = 'default';
                handler.style.cursor = 'move';
                handler.addEventListener('mouseover', function() {
                    el.setAttribute('draggable', true);
                });
    
                handler.addEventListener('mouseout', function() {
                    setTimeout(function() {
                        el.setAttribute('draggable', false);
                    }, 50);
                });
            }
        }

        // Only transfer the key and use an external store for the actual data
        const transferKey = +new Date() + '';


        el.addEventListener('dragstart', function(event){
            Common.dragInProgressKey = transferKey;
            
            Common.transferredData[transferKey] = {
                dragData,
                namespace: Common.getNamespace(binding, vnode),
                onDropCallback: null // will be set in droppable directive
            };

            event.dataTransfer.setData('text', transferKey);
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.dropEffect = 'move';

            if (listeners['drag-start']) {
                listeners['drag-start'](dragData);
            }
        }, false);


        el.addEventListener('drag', function(){
            if (binding.modifiers.dynamic) {
                Common.transferredData[transferKey].namespace = Common.getNamespace(binding, vnode);
            }

            if (listeners['drag-move']) {
                listeners['drag-move'](dragData);
            }
        });
        
        
        el.addEventListener('dragend', function(){
            Common.dragInProgressKey = null;

            if (Common.transferredData[transferKey]) {
                if (typeof Common.transferredData[transferKey].onDropCallback === 'function') {
                    const callback = Common.transferredData[transferKey].onDropCallback;
                    setTimeout(() => callback(), 0);
                }
                delete Common.transferredData[transferKey];
            }

            if (listeners['drag-end']) {
                listeners['drag-end'](dragData);
            }
        });
    }
};