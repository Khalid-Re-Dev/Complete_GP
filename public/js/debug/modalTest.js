/**
 * Modal Test Utilities
 * Quick testing functions for the store setup modal
 */

window.modalTest = {
    // Test if setupStore function exists
    testSetupStoreExists() {
        console.log('🧪 Testing setupStore function...');
        if (typeof window.setupStore === 'function') {
            console.log('✅ setupStore function exists');
            return true;
        } else {
            console.log('❌ setupStore function not found');
            return false;
        }
    },

    // Test modal creation
    testModalCreation() {
        console.log('🧪 Testing modal creation...');
        try {
            window.setupStore();
            
            setTimeout(() => {
                const modal = document.querySelector('[style*="z-index: 9999"]');
                if (modal) {
                    console.log('✅ Modal created successfully');
                    console.log('📊 Modal z-index:', modal.style.zIndex);
                    console.log('📊 Modal position:', modal.style.position);
                    console.log('📊 Modal opacity:', modal.style.opacity);
                    
                    // Auto-close after 3 seconds
                    setTimeout(() => {
                        window.closeStoreSetupModal();
                        console.log('🔄 Auto-closed modal for testing');
                    }, 3000);
                } else {
                    console.log('❌ Modal not found in DOM');
                }
            }, 500);
        } catch (error) {
            console.log('❌ Error creating modal:', error);
        }
    },

    // Test all modal functions
    testAllFunctions() {
        console.log('🧪 Testing all modal functions...');
        
        const functions = [
            'setupStore',
            'proceedToStoreApplication', 
            'closeStoreSetupModal'
        ];
        
        functions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                console.log(`✅ ${funcName} exists`);
            } else {
                console.log(`❌ ${funcName} missing`);
            }
        });
    },

    // Test modal z-index priority
    testZIndex() {
        console.log('🧪 Testing z-index priority...');
        
        // Get all elements with z-index
        const allElements = document.querySelectorAll('*');
        let maxZIndex = 0;
        
        allElements.forEach(el => {
            const zIndex = parseInt(window.getComputedStyle(el).zIndex);
            if (!isNaN(zIndex) && zIndex > maxZIndex) {
                maxZIndex = zIndex;
            }
        });
        
        console.log('📊 Highest z-index on page:', maxZIndex);
        console.log('📊 Modal z-index will be: 9999');
        
        if (maxZIndex < 9999) {
            console.log('✅ Modal z-index is sufficient');
        } else {
            console.log('⚠️ Modal z-index might not be high enough');
        }
    },

    // Run all tests
    runAllTests() {
        console.log('🚀 Running all modal tests...');
        console.log('================================');
        
        this.testSetupStoreExists();
        this.testAllFunctions();
        this.testZIndex();
        
        console.log('================================');
        console.log('🧪 Starting modal creation test in 2 seconds...');
        
        setTimeout(() => {
            this.testModalCreation();
        }, 2000);
    }
};

// Auto-load message
console.log('🧪 Modal Test Utilities loaded!');
console.log('📋 Available commands:');
console.log('   modalTest.runAllTests() - Run all tests');
console.log('   modalTest.testModalCreation() - Test modal creation');
console.log('   modalTest.testZIndex() - Check z-index priority');
console.log('   modalTest.testAllFunctions() - Check function availability');