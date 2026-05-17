import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://malujpcvvkxbaqdkdexn.supabase.co'
const supabaseKey = 'sb_publishable_QGeYvr-nMZNNF1_Qa3haBg_kzD5-h13'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignIn() {
    console.log("Testing sign in...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'sahil@gmail.com',
        password: 'oneplus11R...'
    })

    if (error) {
        console.error("SignIn Error:", error.message);
    } else {
        console.log("SignIn Success! User ID:", data.user?.id);
    }
}

testSignIn();
