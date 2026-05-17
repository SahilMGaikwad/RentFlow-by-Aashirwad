import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://malujpcvvkxbaqdkdexn.supabase.co'
const supabaseKey = 'sb_publishable_QGeYvr-nMZNNF1_Qa3haBg_kzD5-h13'
const supabase = createClient(supabaseUrl, supabaseKey)

async function signUpAdmin() {
    console.log("Registering admin sahil.admin@gmail.com...");
    const { data, error } = await supabase.auth.signUp({
        email: 'sahil.admin@gmail.com',
        password: 'oneplus11R...'
    })

    if (error) {
        console.error("SignUp Error:", error.message);
    } else {
        console.log("SignUp Success! User ID:", data.user?.id);
    }
}

signUpAdmin();
